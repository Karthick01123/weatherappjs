const apiKey = '67836dc72a2c9e86d205afcb6789cf07'; // Replace with your OpenWeatherMap API key

function getWeather(location = null, unit = null) {
  const input = location || document.getElementById('locationInput').value.trim();
  unit = unit || document.getElementById('unitSelect').value;
  const weatherDiv = document.getElementById('weatherResult');

  if (!input) {
    alert("Please enter a city name or ZIP code.");
    return;
  }

  const isZip = /^\d{5}$/.test(input);
  const url = isZip
    ? `https://api.openweathermap.org/data/2.5/weather?zip=${input},us&appid=${apiKey}&units=${unit}`
    : `https://api.openweathermap.org/data/2.5/weather?q=${input}&appid=${apiKey}&units=${unit}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        weatherDiv.innerHTML = `<p>⚠️ ${data.message}</p>`;
        return;
      }

      const tempSymbol = unit === "metric" ? "°C" : "°F";
      const weather = data.weather[0].main.toLowerCase();

      const weatherHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].main}" />
        <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
        <p>🌡️ Temp: ${data.main.temp} ${tempSymbol}</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>🌬️ Wind: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}</p>
      `;

      weatherDiv.innerHTML = weatherHTML;
      updateBackground(weather);
      saveRecentSearch(input);
    })
    .catch(() => {
      weatherDiv.innerHTML = `<p>Something went wrong. Please try again.</p>`;
    });
}

function getWeatherByGeolocation() {
  const unit = document.getElementById('unitSelect').value;
  const weatherDiv = document.getElementById('weatherResult');

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.cod !== 200) {
          weatherDiv.innerHTML = `<p>⚠️ ${data.message}</p>`;
          return;
        }

        const tempSymbol = unit === "metric" ? "°C" : "°F";
        const weather = data.weather[0].main.toLowerCase();

        const weatherHTML = `
          <h2>${data.name}, ${data.sys.country}</h2>
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].main}" />
          <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
          <p>🌡️ Temp: ${data.main.temp} ${tempSymbol}</p>
          <p>💧 Humidity: ${data.main.humidity}%</p>
          <p>🌬️ Wind: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}</p>
        `;

        weatherDiv.innerHTML = weatherHTML;
        updateBackground(weather);
        saveRecentSearch(data.name);
      });
  });
}

function updateBackground(weather) {
  let bg;

  switch (weather) {
    case 'clear':
      bg = 'linear-gradient(to right, #56ccf2, #2f80ed)';
      break;
    case 'clouds':
      bg = 'linear-gradient(to right, #bdc3c7, #2c3e50)';
      break;
    case 'rain':
    case 'drizzle':
      bg = 'linear-gradient(to right, #4b79a1, #283e51)';
      break;
    case 'snow':
      bg = 'linear-gradient(to right, #83a4d4, #b6fbff)';
      break;
    case 'thunderstorm':
      bg = 'linear-gradient(to right, #141e30, #243b55)';
      break;
    default:
      bg = 'linear-gradient(to right, #74ebd5, #ACB6E5)';
  }

  document.body.style.background = bg;
}

function saveRecentSearch(location) {
  let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (!recent.includes(location)) {
    recent.unshift(location);
    if (recent.length > 5) recent.pop(); // Limit to 5 recent
    localStorage.setItem("recentSearches", JSON.stringify(recent));
    renderRecentSearches();
  }
}

function renderRecentSearches() {
  const recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  const container = document.getElementById("recentSearches");
  container.innerHTML = `<h4>Recent:</h4>` + recent.map(loc => 
    `<span onclick="getWeather('${loc}')">${loc}</span>`).join(" ");
}

// Load recent searches on page load
renderRecentSearches();
