const apiKey = '4475cb22eb13c3cdf079bc2d1d494d38'; // Asegúrate de que esta clave sea correcta
const locationInfo = document.getElementById('location-info');
const searchResults = document.getElementById('search-results');

// Mapeo de descripciones del clima y nombres de imágenes
const weatherData = {
    'rain': { description: 'Lluvia', image: 'images/rain.jpg' },
    'sun': { description: 'Despejado', image: 'images/sun.jpg' },
    'clouds': { description: 'Nublado', image: 'images/clouds.jpg' },
    'snow': { description: 'Nieve', image: 'images/snow.webp' }
};

document.getElementById('get-location').addEventListener('click', getLocation);
document.getElementById('search-button').addEventListener('click', searchCity);

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
    fetchWeather(lat, lon);
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
        return;
    }
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const suggestionsList = document.getElementById('suggestions');
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const { lat, lon } = data.coord;
            fetchWeather(lat, lon);
        })
        .catch(error => console.error('Error al buscar la ciudad:', error));
}

function fetchWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            let description = data.weather[0].description.toLowerCase();
            let weatherKey;

            if (description.includes('rain')) {
                weatherKey = 'rain';
            } else if (description.includes('clear')) {
                weatherKey = 'sun';
            } else if (description.includes('clouds')) {
                weatherKey = 'clouds';
            } else if (description.includes('snow')) {
                weatherKey = 'snow';
            } else {
                weatherKey = 'clouds'; // Default to clouds if not matched
            }

            const weatherInfo = weatherData[weatherKey];
            locationInfo.innerHTML = `
                <div class="weather-container" style="background-image: url(${weatherInfo.image});">
                    <div class="weather-content">
                        <h2>${data.name}</h2>
                        <p>Temperatura: ${data.main.temp}°C</p>
                        <p>Condiciones: ${weatherInfo.description}</p>
                    </div>
                </div>
            `;
        })
        .catch(error => console.error('Error al obtener el clima:', error));
}