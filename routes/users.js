const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usersController = require('../controllers/usersController');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

function requireLogin(req, res, next){
  if (!req.session.user) {
    req.flash('error', 'You must be logged in');
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/profile', requireLogin, usersController.getProfile);
router.post('/profile', requireLogin, upload.single('profileImage'), usersController.updateProfile);

module.exports = router;
