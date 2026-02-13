const mongoose = require('mongoose');

const travelPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    destination: { type: String, required: true },
    country: { type: String, default: '' },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    travelDate: { type: Date, required: true },
    weatherScore: { type: Number, default: 0 },
    insights: [{
        type: { type: String },
        level: String,
        message: String,
    }],
    weatherData: {
        tempMax: Number,
        tempMin: Number,
        precipitation: Number,
        precipitationProbability: Number,
        windSpeed: Number,
        uvIndex: Number,
        weatherCode: Number,
        description: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('TravelPlan', travelPlanSchema);
