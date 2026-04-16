const express = require('express');
const router = express.Router();
const multer = require('multer');
const usersController = require('../controllers/usersController');
const { requireLogin } = require('../middleware/authMiddleware');
const { profileStorage } = require('../config/cloudinary');

const upload = multer({ storage: profileStorage });

router.get('/profile', requireLogin, usersController.getProfile);
router.post('/profile', requireLogin, upload.single('profileImage'), usersController.updateProfile);

module.exports = router;
