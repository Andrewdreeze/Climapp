const apiKey = '4475cb22eb13c3cdf079bc2d1d494d38';
const locationInfo = document.getElementById('location-info');
const searchResults = document.getElementById('search-results');
const suggestionsList = document.getElementById('suggestions');

document.getElementById('get-location').addEventListener('click', getLocation);
document.getElementById('search-button').addEventListener('click', searchCity);
document.getElementById('city-search').addEventListener('input', suggestCities);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        locationInfo.innerHTML = "Geolocalización no es compatible con este navegador.";
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            locationInfo.innerHTML = `
                <h2>${data.name}</h2>
                <p>Temperatura: ${data.main.temp}°C</p>
                <p>Condiciones: ${data.weather[0].description}</p>
            `;
        })
        .catch(error => console.error('Error al obtener el clima:', error));
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            locationInfo.innerHTML = "Usuario denegó la solicitud de Geolocalización."
            break;
        case error.POSITION_UNAVAILABLE:
            locationInfo.innerHTML = "La ubicación no está disponible."
            break;
        case error.TIMEOUT:
            locationInfo.innerHTML = "El tiempo de respuesta ha expirado."
            break;
        case error.UNKNOWN_ERROR:
            locationInfo.innerHTML = "Un error desconocido ocurrió."
            break;
    }
}

async function suggestCities(event) {
    const query = event.target.value;
    if (query.length < 3) {
        suggestionsList.innerHTML = '';
        return;
    }
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`);
        const data = await response.json();
        suggestionsList.innerHTML = data.list.map(city => `<li>${city.name}, ${city.sys.country}</li>`).join('');
        suggestionsList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('city-search').value = item.textContent;
                suggestionsList.innerHTML = '';
            });
        });
    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
    }
}

function searchCity() {
    const city = document.getElementById('city-search').value;
    if (!city) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            searchResults.innerHTML = `
                <h2>${data.name}</h2>
                <p>Temperatura: ${data.main.temp}°C</p>
                <p>Condiciones: ${data.weather[0].description}</p>
            `;
        })
        .catch(error => console.error('Error al buscar la ciudad:', error));
}
