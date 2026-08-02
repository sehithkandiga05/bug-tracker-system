const express = require('express');
const router = express.Router();
const {
  summarizeBug,
  predictPriority,
  checkDuplicates,
  getSuggestedFix,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/summarize', summarizeBug);
router.post('/predict-priority', predictPriority);
router.post('/detect-duplicates', checkDuplicates);
router.post('/suggested-fix', getSuggestedFix);

module.exports = router;
