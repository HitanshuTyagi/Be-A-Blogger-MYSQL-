const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

router.get('/posts', indexController.getHome);
router.post('/contact', indexController.submitContact);

module.exports = router;
