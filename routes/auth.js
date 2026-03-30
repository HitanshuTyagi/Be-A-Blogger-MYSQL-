const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register form
router.get('/register', authController.renderRegister);

// Register submit
router.post('/register', authController.submitRegister);

// Login form
router.get('/login', authController.renderLogin);

// Login submit
router.post('/login', authController.submitLogin);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
