const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postsController = require('../controllers/postsController');

// Multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// helper to check auth
function requireLogin(req, res, next){
  if (!req.session.user) {
    req.flash('error', 'You must be logged in');
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/new', requireLogin, postsController.renderNew);
router.post('/', requireLogin, upload.single('image'), postsController.createPost);
router.get('/:slug', postsController.showPost);
router.get('/:id/edit', requireLogin, postsController.renderEdit);
router.put('/:id', requireLogin, upload.single('image'), postsController.updatePost);
router.delete('/:id', requireLogin, postsController.deletePost);
router.post('/:slug/comments', postsController.addComment);
router.delete('/:slug/comments/:commentId', requireLogin, postsController.deleteComment);
router.post('/:id/like', requireLogin, postsController.likePost);

module.exports = router;