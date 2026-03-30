const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

router.get('/', indexController.getHome);
router.get("/about", indexController.getAbout);
router.get("/contact", indexController.getContact);
router.post("/contact", indexController.submitContact);

module.exports = router;
