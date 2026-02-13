const express = require('express');
const { getWeatherByCity, getWeatherByCoords, searchCities } = require('../controllers/weatherController');

const router = express.Router();

router.get('/search/:query', searchCities);
router.get('/coords', getWeatherByCoords);
router.get('/:city', getWeatherByCity);

module.exports = router;
