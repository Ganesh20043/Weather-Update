const apiKey = 'c58e892a1ec3bbf30def0c3184833b8d'; 

const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const weatherContainer = document.getElementById('weather-container');
const errorMessage = document.getElementById('error-message');
const recentSearchesDiv = document.getElementById('recent-searches');

let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

function saveRecentSearch(city) {
  if (!recentSearches.includes(city.toLowerCase())) {
    recentSearches.unshift(city.toLowerCase());
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    renderRecentSearches();
  }
}

function renderRecentSearches() {
  recentSearchesDiv.innerHTML = '';
  recentSearches.forEach(city => {
    const btn = document.createElement('button');
    btn.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    btn.addEventListener('click', () => {
      cityInput.value = btn.textContent;
      fetchWeather(btn.textContent);
    });
    recentSearchesDiv.appendChild(btn);
  });
}

async function fetchWeather(city) {
  errorMessage.classList.add('hidden');
  weatherContainer.classList.add('hidden');
  currentWeatherDiv.innerHTML = '';
  forecastDiv.innerHTML = '';

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!currentResponse.ok) throw new Error('City not found');
    const currentData = await currentResponse.json();

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!forecastResponse.ok) throw new Error('Forecast not found');
    const forecastData = await forecastResponse.json();

    renderCurrentWeather(currentData);
    renderForecast(forecastData);
    weatherContainer.classList.remove('hidden');
    saveRecentSearch(city);
  } catch (err) {
    errorMessage.textContent = err.message;
    errorMessage.classList.remove('hidden');
  }
}

function renderCurrentWeather(data) {
  const date = new Date(data.dt * 1000);
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  currentWeatherDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>${date.toLocaleDateString()}</p>
    <img src="${iconUrl}" alt="${data.weather[0].description}" />
    <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
    <p>Temperature: ${data.main.temp.toFixed(1)} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

function renderForecast(data) {
  // Filter to one forecast per day at 12:00pm
  const noonForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
  forecastDiv.innerHTML = '';

  noonForecasts.forEach(item => {
    const date = new Date(item.dt * 1000);
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('forecast-day');
    dayDiv.innerHTML = `
      <h3>${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
      <img src="${iconUrl}" alt="${item.weather[0].description}" />
      <p>${item.weather[0].main}</p>
      <p>Temp: ${item.main.temp.toFixed(1)} °C</p>
      <p>Humidity: ${item.main.humidity}%</p>
    `;
    forecastDiv.appendChild(dayDiv);
  });
}

// Event listeners
form.addEventListener('submit', e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    cityInput.value = '';
  }
});

// Load recent searches on page load
renderRecentSearches();