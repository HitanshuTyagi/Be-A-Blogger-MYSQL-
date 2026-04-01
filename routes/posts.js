const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postsController = require('../controllers/postsController');
const { requireLogin, optionalAuth } = require('../middleware/authMiddleware');

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

router.post('/', requireLogin, upload.single('image'), postsController.createPost);
router.get('/:slug', postsController.showPost);
router.get('/:id/edit', requireLogin, postsController.getPostForEdit);
router.put('/:id', requireLogin, upload.single('image'), postsController.updatePost);
router.delete('/:id', requireLogin, postsController.deletePost);
router.post('/:slug/comments', optionalAuth, postsController.addComment);
router.delete('/:slug/comments/:commentId', requireLogin, postsController.deleteComment);
router.post('/:id/like', requireLogin, postsController.likePost);

module.exports = router;