const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/register', authController.submitRegister);
router.post('/login', authController.submitLogin);
router.post('/logout', authController.logout);
router.get('/me', optionalAuth, authController.getMe);

module.exports = router;
