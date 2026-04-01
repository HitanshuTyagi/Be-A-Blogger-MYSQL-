const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const post = new Post({
      title,
      content,
      authorId: req.user.id,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category,
      image: req.file ? '/uploads/' + req.file.filename : null
    });
    await post.save();
    res.json({ post, message: 'Post created' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.showPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { slug: req.params.slug },
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'profileImage'] }]
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const comments = await Comment.findAll({
      where: { postId: post.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ error: 'Error loading post' });
  }
};

exports.getPostForEdit = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.authorId != req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Error loading post' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.authorId != req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, content, tags, category, removeImage } = req.body;
    post.title = title;
    post.content = content;
    post.tags = tags ? tags.split(',').map(t => t.trim()) : [];
    post.category = category;

    if (req.file) {
      post.image = '/uploads/' + req.file.filename;
    } else if (removeImage === 'true') {
      post.image = null;
    }

    await post.save();
    res.json({ post, message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Comment.destroy({ where: { postId: post.id } });
    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting post' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      postId: post.id,
      authorId: req.user ? req.user.id : null,
      authorName: req.body.name || (req.user ? req.user.username : 'Anonymous'),
      text: req.body.text
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }]
    });

    res.json({ comment: commentWithAuthor, message: 'Comment added' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.json({ ok: false, error: 'Post not found' });

    const uid = req.user.id;
    let likes = post.likes || [];
    const idx = likes.indexOf(uid);

    if (idx === -1) {
      likes.push(uid);
    } else {
      likes.splice(idx, 1);
    }

    post.likes = likes;
    post.changed('likes', true);

    await post.save();
    res.json({ ok: true, likes: post.likes.length, likedByUser: likes.includes(uid) });
  } catch (error) {
    res.json({ ok: false, error: 'Server error' });
  }
};
