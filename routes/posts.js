const express = require('express');
const router = express.Router();
const multer = require('multer');
const postsController = require('../controllers/postsController');
const { requireLogin, optionalAuth } = require('../middleware/authMiddleware');
const { postStorage } = require('../config/cloudinary');

const upload = multer({ storage: postStorage });

router.post('/', requireLogin, upload.single('image'), postsController.createPost);
router.get('/:slug', postsController.showPost);
router.get('/:id/edit', requireLogin, postsController.getPostForEdit);
router.put('/:id', requireLogin, upload.single('image'), postsController.updatePost);
router.delete('/:id', requireLogin, postsController.deletePost);
router.post('/:slug/comments', optionalAuth, postsController.addComment);
router.delete('/:slug/comments/:commentId', requireLogin, postsController.deleteComment);
router.post('/:id/like', requireLogin, postsController.likePost);

module.exports = router;