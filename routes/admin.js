const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/adminMiddleware');

// Apply admin middleware to all routes in this file
router.use(requireAdmin);

// Admin Dashboard
router.get('/', adminController.getDashboard);

// Manage Users page
router.get('/users', adminController.getUsers);

// Promote user to admin
router.post('/users/:id/make-admin', adminController.makeAdmin);

// Delete user
router.post('/users/:id/delete', adminController.deleteUser);

module.exports = router;
