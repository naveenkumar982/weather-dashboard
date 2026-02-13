const weatherService = require('../services/weatherService');

// @desc    Get weather by city name
// @route   GET /api/weather/:city
const getWeatherByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const unit = req.query.unit || 'celsius';

        // Geocode city to lat/lon
        const locations = await weatherService.geocodeCity(city);
        const loc = locations[0];

        // Fetch weather + air quality in parallel
        const [weather, airQuality] = await Promise.all([
            weatherService.getWeatherData(loc.latitude, loc.longitude, unit),
            weatherService.getAirQuality(loc.latitude, loc.longitude),
        ]);

        res.json({
            location: {
                name: loc.name,
                country: loc.country || '',
                admin1: loc.admin1 || '',
                lat: loc.latitude,
                lon: loc.longitude,
            },
            weather,
            airQuality,
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
    }
};

// @desc    Get weather by coordinates
// @route   GET /api/weather/coords
const getWeatherByCoords = async (req, res) => {
    try {
        const { lat, lon, unit } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude required' });
        }

        const [weather, airQuality] = await Promise.all([
            weatherService.getWeatherData(lat, lon, unit || 'celsius'),
            weatherService.getAirQuality(lat, lon),
        ]);

        res.json({ weather, airQuality });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
    }
};

// @desc    Search/geocode cities
// @route   GET /api/weather/search/:query
const searchCities = async (req, res) => {
    try {
        const locations = await weatherService.geocodeCity(req.params.query);
        res.json(locations);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { getWeatherByCity, getWeatherByCoords, searchCities };
