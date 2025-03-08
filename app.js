const API_KEY = "76b883e7d6f10e428bb62318620c9915"; 


async function fetchWeather(city = null) {
    if (!city) {
        city = document.getElementById("city").value;
        if (!city) {
            alert("Please enter a city name");
            return;
        }
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        let weatherResponse = await fetch(weatherUrl);
        let forecastResponse = await fetch(forecastUrl);

        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error("City not found");
        }

        let weatherData = await weatherResponse.json();
        let forecastData = await forecastResponse.json();

        saveRecentSearch(city);
        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        alert(error.message);
    }
}
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
               
                let geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
                let geoData = await geoResponse.json();

                if (geoData.length > 0) {
                    let city = geoData[0].name;
                    fetchWeather(city);
                } else {
                    alert("Unable to fetch city name from your location.");
                }
            } catch (error) {
                console.error("Error fetching location:", error);
                alert("Error getting your location. Please try again.");
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Location access denied. Please enable location services.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}


function displayWeather(data) {
    let weatherBox = document.getElementById("weather-info");
    weatherBox.innerHTML = `
        <h2>${data.name} (${new Date().toISOString().split("T")[0]})</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Wind: ${data.wind.speed} M/S</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `;
}


function displayForecast(data) {
    let forecastBox = document.getElementById("forecast");
    let forecastCards = document.getElementById("forecast-cards");
    forecastCards.innerHTML = "";

    let dailyData = {};
    data.list.forEach(item => {
        let date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) {
            dailyData[date] = item;
        }
    });

    Object.keys(dailyData).slice(0, 5).forEach(date => {
        let forecast = dailyData[date];
        let forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-card");
        forecastCard.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>Wind: ${forecast.wind.speed} M/S</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
        `;
        forecastCards.appendChild(forecastCard);
    });

    forecastBox.classList.remove("hidden");
}


function saveRecentSearch(city) {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 5) recentCities.pop();
        localStorage.setItem("recentCities", JSON.stringify(recentCities));
    }
    updateRecentSearchDropdown();
}


function updateRecentSearchDropdown() {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    let dropdown = document.getElementById("recent-search");
    let container = document.getElementById("recent-search-container");

    if (recentCities.length === 0) {
        container.classList.add("hidden");
    } else {
        container.classList.remove("hidden");
        dropdown.innerHTML = `<option value="">Select a city</option>`;
        recentCities.forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            dropdown.appendChild(option);
        });
    }
}


function fetchWeatherFromDropdown() {
    let city = document.getElementById("recent-search").value;
    if (city) {
        fetchWeather(city);
    }
}


document.addEventListener("DOMContentLoaded", updateRecentSearchDropdown);
