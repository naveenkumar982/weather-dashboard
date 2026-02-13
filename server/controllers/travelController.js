const TravelPlan = require('../models/TravelPlan');
const weatherService = require('../services/weatherService');

// @desc    Create a travel plan
// @route   POST /api/travel-plan
const createPlan = async (req, res) => {
    try {
        const { destination, travelDate } = req.body;

        if (!destination || !travelDate) {
            return res.status(400).json({ message: 'Destination and travel date are required' });
        }

        // Geocode destination
        const locations = await weatherService.geocodeCity(destination);
        const loc = locations[0];

        // Fetch forecast
        const weatherData = await weatherService.getWeatherData(loc.latitude, loc.longitude);
        const daily = weatherData.daily;

        // Find the matching day in forecast (within 7 days)
        const targetDate = new Date(travelDate).toISOString().split('T')[0];
        const dayIndex = daily.time.findIndex(t => t === targetDate);

        if (dayIndex === -1) {
            return res.status(400).json({
                message: 'Travel date must be within the next 7 days for accurate forecast data.'
            });
        }

        // Generate insights and score
        const insights = weatherService.generateInsights(daily, dayIndex);
        const weatherScore = weatherService.calculateWeatherScore(daily, dayIndex);

        // WMO weather codes description
        const WMO_DESC = {
            0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
            55: 'Dense Drizzle', 61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
            71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
            80: 'Rain Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
            95: 'Thunderstorm', 96: 'Thunderstorm + Hail', 99: 'Severe Thunderstorm'
        };

        const plan = await TravelPlan.create({
            userId: req.user._id,
            destination: loc.name,
            country: loc.country || '',
            lat: loc.latitude,
            lon: loc.longitude,
            travelDate: new Date(travelDate),
            weatherScore,
            insights,
            weatherData: {
                tempMax: daily.temperature_2m_max[dayIndex],
                tempMin: daily.temperature_2m_min[dayIndex],
                precipitation: daily.precipitation_sum[dayIndex],
                precipitationProbability: daily.precipitation_probability_max[dayIndex],
                windSpeed: daily.wind_speed_10m_max[dayIndex],
                uvIndex: daily.uv_index_max[dayIndex],
                weatherCode: daily.weather_code[dayIndex],
                description: WMO_DESC[daily.weather_code[dayIndex]] || 'Unknown',
            }
        });

        res.status(201).json(plan);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to create travel plan', error: error.message });
    }
};

// @desc    Get user's travel plans
// @route   GET /api/travel-plan
const getPlans = async (req, res) => {
    try {
        const plans = await TravelPlan.find({ userId: req.user._id })
            .sort({ travelDate: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a travel plan
// @route   DELETE /api/travel-plan/:id
const deletePlan = async (req, res) => {
    try {
        const plan = await TravelPlan.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json({ message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createPlan, getPlans, deletePlan };
