const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getUsers);
router.put('/:id/role', authorize('Admin'), updateUserRole);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
