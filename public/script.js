// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const weatherCard = document.getElementById('weatherCard');
const toggleAdvanced = document.getElementById('toggleAdvanced');
const advancedDetails = document.getElementById('advancedDetails');

// API Base URL
const API_BASE_URL = 'http://localhost:3000/weather';

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

toggleAdvanced.addEventListener('click', () => {
    advancedDetails.classList.toggle('hidden');
    toggleAdvanced.classList.toggle('active');
});

// Handle search
async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    // Basic client-side validation
    if (city.length > 100) {
        showError('City name is too long (max 100 characters)');
        return;
    }
    
    hideAllSections();
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}?city=${encodeURIComponent(city)}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch weather data');
        }
        
        // Handle new API response format
        const data = result.data || result;
        displayWeatherData(data);
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

// Display weather data
function displayWeatherData(data) {
    const { location, current } = data;
    
    // Location information
    document.getElementById('locationName').textContent = location.name;
    document.getElementById('locationDetails').textContent = 
        `${location.region}, ${location.country}`;
    document.getElementById('localTime').textContent = 
        `Local time: ${formatLocalTime(location.localtime)}`;
    
    // Main temperature
    document.getElementById('tempC').textContent = Math.round(current.temp_c);
    document.getElementById('tempF').textContent = Math.round(current.temp_f);
    document.getElementById('feelsLikeC').textContent = Math.round(current.feelslike_c);
    
    // Weather condition
    document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
    document.getElementById('weatherIcon').alt = current.condition.text;
    document.getElementById('weatherCondition').textContent = current.condition.text;
    document.getElementById('lastUpdated').textContent = 
        `Updated: ${formatTime(current.last_updated)}`;
    
    // Weather details
    document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h`;
    document.getElementById('windDirection').textContent = `${current.wind_dir} (${current.wind_degree}°)`;
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('pressure').textContent = `${current.pressure_mb} mb`;
    document.getElementById('visibility').textContent = `${current.vis_km} km`;
    document.getElementById('uvIndex').textContent = getUVDescription(current.uv);
    document.getElementById('cloudCover').textContent = `${current.cloud}%`;
    
    // Advanced details
    document.getElementById('heatIndex').textContent = 
        `${Math.round(current.heatindex_c)}°C (${Math.round(current.heatindex_f)}°F)`;
    document.getElementById('windChill').textContent = 
        `${Math.round(current.windchill_c)}°C (${Math.round(current.windchill_f)}°F)`;
    document.getElementById('dewPoint').textContent = 
        `${Math.round(current.dewpoint_c)}°C (${Math.round(current.dewpoint_f)}°F)`;
    document.getElementById('windGust').textContent = `${current.gust_kph} km/h`;
    document.getElementById('precipitation').textContent = 
        `${current.precip_mm} mm (${current.precip_in}")`;
    document.getElementById('solarRadiation').textContent = 
        `${Math.round(current.short_rad)} W/m²`;
    
    showWeatherCard();
}

// Utility functions
function hideAllSections() {
    weatherCard.classList.add('hidden');
    error.classList.add('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
}

function showWeatherCard() {
    weatherCard.classList.remove('hidden');
}

function formatLocalTime(localtime) {
    const date = new Date(localtime);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getUVDescription(uvIndex) {
    if (uvIndex <= 2) return `${uvIndex} (Low)`;
    if (uvIndex <= 5) return `${uvIndex} (Moderate)`;
    if (uvIndex <= 7) return `${uvIndex} (High)`;
    if (uvIndex <= 10) return `${uvIndex} (Very High)`;
    return `${uvIndex} (Extreme)`;
}

// Load default city on page load
document.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'Cairo';
    handleSearch();
});
