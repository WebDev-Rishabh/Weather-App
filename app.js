const API_KEY = "76b883e7d6f10e428bb62318620c9915"; 
async function fetchWeather() {
    let city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name");
        return;
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

        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        alert(error.message);
    }
}

function displayWeather(data) {
    let weatherBox = document.getElementById("weather-info");
    weatherBox.innerHTML = `
        <h2>${data.name} (${new Date().toISOString().split("T")[0]})</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Wind: ${data.wind.speed} M/S</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>AQI: ${data.main.aqi}%</p>
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
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>Wind: ${forecast.wind.speed} M/S</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
           `;
        forecastCards.appendChild(forecastCard);
    });

    forecastBox.classList.remove("hidden");
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function fetchWeatherByCoords(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
        let weatherResponse = await fetch(weatherUrl);
        let forecastResponse = await fetch(forecastUrl);

        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error("Error fetching location weather data");
        }

        let weatherData = await weatherResponse.json();
        let forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        alert(error.message);
    }
}
