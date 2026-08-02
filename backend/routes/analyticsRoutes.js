const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getDeveloperPerformance,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardMetrics);
router.get('/developer-performance', getDeveloperPerformance);

module.exports = router;
