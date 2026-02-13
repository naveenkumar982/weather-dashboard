const express = require('express');
const { signup, login, getProfile, saveCity, removeCity, getSavedCities } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/cities', protect, getSavedCities);
router.post('/cities', protect, saveCity);
router.delete('/cities/:cityName', protect, removeCity);

module.exports = router;
