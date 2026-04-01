const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usersController = require('../controllers/usersController');
const { requireLogin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/profile', requireLogin, usersController.getProfile);
router.post('/profile', requireLogin, upload.single('profileImage'), usersController.updateProfile);

module.exports = router;
