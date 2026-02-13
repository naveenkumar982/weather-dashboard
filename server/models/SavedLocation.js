const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cityName: { type: String, required: true },
    country: { type: String, default: '' },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    dateSearched: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SavedLocation', savedLocationSchema);
