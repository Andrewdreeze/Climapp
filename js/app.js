const apiKey = '4475cb22eb13c3cdf079bc2d1d494d38'; // Asegúrate de que esta clave sea correcta
const locationInfo = document.getElementById('location-info');
const searchResults = document.getElementById('search-results');
const forecastResults = document.getElementById('forecast-results');
const suggestionsList = document.getElementById('suggestions');

// Mapeo de descripciones del clima
const weatherDescriptions = {
    'clear sky': 'Cielo Despejado',
    'few clouds': 'Pocas Nubes',
    'scattered clouds': 'Nubes Dispersas',
    'broken clouds': 'Nubes Rotas',
    'shower rain': 'Aguacero',
    'rain': 'Lluvia',
    'thunderstorm': 'Tormenta Eléctrica',
    'snow': 'Nieve',
    'mist': 'Niebla',
    'smoke': 'Humo',
    'haze': 'Bruma',
    'dust': 'Polvo',
    'fog': 'Niebla',
    'sand': 'Arena',
    'ash': 'Cenizas',
    'squalls': 'Rachas de Viento',
    'tornado': 'Tornado'
};

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
    fetchWeather(lat, lon);
    fetchForecast(lat, lon);
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
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const { lat, lon } = data.coord;
            fetchWeather(lat, lon);
            fetchForecast(lat, lon);
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
            const description = weatherDescriptions[data.weather[0].description] || data.weather[0].description;
            locationInfo.innerHTML = `
                <h2>${data.name}</h2>
                <p>Temperatura: ${data.main.temp}°C</p>
                <p>Condiciones: ${description}</p>
            `;
        })
        .catch(error => console.error('Error al obtener el clima:', error));
}

function fetchForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.daily) {
                throw new Error('No se encontraron datos diarios en la respuesta.');
            }
            const dailyForecast = data.daily.slice(1, 6); // Get the next 5 days
            forecastResults.innerHTML = dailyForecast.map(day => {
                const description = weatherDescriptions[day.weather[0].description] || day.weather[0].description;
                return `
                    <div class="forecast-day">
                        <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
                        <p>Temperatura Máxima: ${day.temp.max}°C</p>
                        <p>Temperatura Mínima: ${day.temp.min}°C</p>
                        <p>Condiciones: ${description}</p>
                    </div>
                `;
            }).join('');
        })
        .catch(error => console.error('Error al obtener el pronóstico:', error));
}
