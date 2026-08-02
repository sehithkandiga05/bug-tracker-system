const express = require('express');
const router = express.Router();
const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  exportBugs,
} = require('../controllers/bugController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/export/:format', exportBugs);
router.route('/').get(getBugs).post(upload.array('attachments', 5), createBug);
router
  .route('/:id')
  .get(getBugById)
  .put(updateBug)
  .delete(authorize('Admin'), deleteBug);

module.exports = router;
