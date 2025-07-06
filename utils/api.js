import axios from 'axios';

const OPENWEATHER_API_KEY = '9a66c90c22eacbeec436bbb6f5f24a14'; // Replace with your API key
const IQAIR_API_KEY = '911c6b02-f88d-4ba4-a23a-d0a8e5e36d17'; // Replace with your IQAir API key

export async function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const response = await axios.get(url);
  return response.data;
}

export async function fetchPollution(lat, lon) {
  // IQAir AirVisual API for nearest city
  const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${IQAIR_API_KEY}`;
  const response = await axios.get(url);
  return response.data;
}

// IQAir API: /v2/cities?state=STATE&country=COUNTRY&key=API_KEY
// For demo, we mock country/state as 'California', 'USA' for now
export async function fetchCitySuggestions(state = 'California', country = 'USA') {
  const url = `https://api.airvisual.com/v2/cities?state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${IQAIR_API_KEY}`;
  const response = await axios.get(url);
  // Returns { data: { cities: [ ... ] } }
  return response.data.data.cities;
} 