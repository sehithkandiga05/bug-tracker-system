const express = require('express');
const router = express.Router();
const { getCommentsByBug, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/bug/:bugId', getCommentsByBug);
router.post('/', addComment);

module.exports = router;
