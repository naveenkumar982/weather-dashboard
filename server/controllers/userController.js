const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({ email, password });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Save a city to user's favorites
// @route   POST /api/auth/cities
const saveCity = async (req, res) => {
    try {
        const { cityName, country, lat, lon } = req.body;
        const user = await User.findById(req.user._id);

        const exists = user.savedCities.find(c => c.cityName === cityName);
        if (exists) {
            return res.status(400).json({ message: 'City already saved' });
        }

        user.savedCities.push({ cityName, country, lat, lon });
        await user.save();

        res.json(user.savedCities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove a saved city
// @route   DELETE /api/auth/cities/:cityName
const removeCity = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedCities = user.savedCities.filter(c => c.cityName !== req.params.cityName);
        await user.save();
        res.json(user.savedCities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get saved cities
// @route   GET /api/auth/cities
const getSavedCities = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.savedCities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { signup, login, getProfile, saveCity, removeCity, getSavedCities };
