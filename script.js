const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const toggleDark = document.getElementById("toggleDark");
const showFavoritesBtn = document.getElementById("showFavorites");

// 🔑 Replace with your API keys
const UNSPLASH_KEY = "YOUR_UNSPLASH_KEY";
const WEATHER_KEY = "YOUR_OPENWEATHER_KEY";

// Dark mode persistence
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Search button
searchBtn.addEventListener("click", () => {
  const place = searchInput.value.trim();
  if (place) {
    fetchDestination(place);
  } else {
    resultsDiv.innerHTML = "<p>⚠️ Please enter a destination.</p>";
  }
});

// Fetch destination data
async function fetchDestination(place) {
  resultsDiv.innerHTML = "<p>⏳ Fetching travel details...</p>";

  try {
    // Unsplash API for destination images
    const imgRes = await fetch(`https://api.unsplash.com/search/photos?query=${place}&client_id=${UNSPLASH_KEY}&per_page=1`);
    const imgData = await imgRes.json();
    const imageUrl = imgData.results[0]?.urls.small || "https://via.placeholder.com/300";

    // OpenWeather API for weather
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${WEATHER_KEY}&units=metric`);
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      resultsDiv.innerHTML = "<p>❌ Destination not found. Try another place.</p>";
      return;
    }

    // Display card
    resultsDiv.innerHTML = `
      <div class="card">
        <img src="${imageUrl}" alt="${place}">
        <div class="card-content">
          <h3>${place}</h3>
          <p>🌡️ Temp: ${weatherData.main.temp}°C</p>
          <p>☁️ Weather: ${weatherData.weather[0].description}</p>
          <p>💨 Wind: ${weatherData.wind.speed} m/s</p>
          <button class="favorite-btn" onclick="saveFavorite('${place}', '${imageUrl}', '${weatherData.weather[0].description}')">⭐ Save to Favorites</button>
        </div>
      </div>
    `;
  } catch (error) {
    resultsDiv.innerHTML = "<p>⚠️ Could not fetch data. Please try again.</p>";
    console.error(error);
  }
}

// Save favorites to localStorage
function saveFavorite(place, imageUrl, weather) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push({ place, imageUrl, weather });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`${place} added to favorites!`);
}

// Show favorites
showFavoritesBtn.addEventListener("click", () => {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.length === 0) {
    resultsDiv.innerHTML = "<p>⭐ No favorites saved yet.</p>";
    return;
  }

  resultsDiv.innerHTML = favorites.map(fav => `
    <div class="card">
      <img src="${fav.imageUrl}" alt="${fav.place}">
      <div class="card-content">
        <h3>${fav.place}</h3>
        <p>☁️ Weather: ${fav.weather}</p>
      </div>
    </div>
  `).join("");
});
