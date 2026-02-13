// Weather Service — handles all external API calls to Open-Meteo

const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1';

// Geocode a city name to lat/lon
async function geocodeCity(cityName) {
    const res = await fetch(
        `${GEO_URL}/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
        throw new Error(`City "${cityName}" not found`);
    }
    return data.results;
}

// Fetch current weather + forecast
async function getWeatherData(lat, lon, unit = 'celsius') {
    const unitParam = unit === 'fahrenheit' ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '';

    const url = `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
        `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
        `&timezone=auto${unitParam}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    return await res.json();
}

// Fetch air quality data
async function getAirQuality(lat, lon) {
    const url = `${AIR_URL}/air-quality?latitude=${lat}&longitude=${lon}` +
        `&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch air quality data');
    return await res.json();
}

// Generate weather insights for travel planning
function generateInsights(dailyData, dayIndex) {
    const insights = [];
    const d = dailyData;

    // Temperature insights
    const tempMax = d.temperature_2m_max[dayIndex];
    const tempMin = d.temperature_2m_min[dayIndex];
    if (tempMax > 35) {
        insights.push({ type: 'heat', level: 'high', message: `Extreme heat expected (${Math.round(tempMax)}°C). Stay hydrated and seek shade.` });
    } else if (tempMax > 30) {
        insights.push({ type: 'heat', level: 'moderate', message: `Hot conditions (${Math.round(tempMax)}°C). Carry water and sunscreen.` });
    }
    if (tempMin < 5) {
        insights.push({ type: 'cold', level: 'high', message: `Very cold (${Math.round(tempMin)}°C). Pack warm clothing.` });
    }

    // Rain insights
    const rainProb = d.precipitation_probability_max[dayIndex];
    const rainSum = d.precipitation_sum[dayIndex];
    if (rainProb > 60) {
        insights.push({ type: 'rain', level: 'high', message: `High chance of rain (${rainProb}%). Carry an umbrella.` });
    } else if (rainProb > 30) {
        insights.push({ type: 'rain', level: 'moderate', message: `Moderate rain chance (${rainProb}%). Be prepared.` });
    }

    // Wind insights
    const windMax = d.wind_speed_10m_max[dayIndex];
    if (windMax > 50) {
        insights.push({ type: 'wind', level: 'high', message: `Strong winds expected (${Math.round(windMax)} km/h). Outdoor activities may be affected.` });
    }

    // UV insights
    const uv = d.uv_index_max[dayIndex];
    if (uv >= 8) {
        insights.push({ type: 'uv', level: 'high', message: `Very high UV index (${uv}). Apply SPF 50+ sunscreen.` });
    } else if (uv >= 5) {
        insights.push({ type: 'uv', level: 'moderate', message: `Moderate UV (${uv}). Wear sunscreen.` });
    }

    // No alerts = good weather!
    if (insights.length === 0) {
        insights.push({ type: 'good', level: 'low', message: 'Great weather expected! Perfect for outdoor activities.' });
    }

    return insights;
}

// Calculate travel weather score (0-100)
function calculateWeatherScore(dailyData, dayIndex) {
    let score = 100;

    const tempMax = dailyData.temperature_2m_max[dayIndex];
    const rainProb = dailyData.precipitation_probability_max[dayIndex];
    const windMax = dailyData.wind_speed_10m_max[dayIndex];
    const uv = dailyData.uv_index_max[dayIndex];

    // Temperature penalty
    if (tempMax > 38) score -= 25;
    else if (tempMax > 35) score -= 15;
    else if (tempMax > 30) score -= 5;
    if (tempMax < 0) score -= 20;
    else if (tempMax < 5) score -= 10;

    // Rain penalty
    score -= Math.min(rainProb * 0.3, 30);

    // Wind penalty
    if (windMax > 50) score -= 20;
    else if (windMax > 30) score -= 10;

    // UV penalty
    if (uv >= 10) score -= 10;
    else if (uv >= 8) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = {
    geocodeCity,
    getWeatherData,
    getAirQuality,
    generateInsights,
    calculateWeatherScore,
};
