const express = require('express');
const { createPlan, getPlans, deletePlan } = require('../controllers/travelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createPlan);
router.get('/', protect, getPlans);
router.delete('/:id', protect, deletePlan);

module.exports = router;
