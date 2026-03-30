const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

exports.renderNew = (req, res) => {
  res.render('posts/new');
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const post = new Post({
      title,
      content,
      authorId: req.session.user.id,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category,
      image: req.file ? '/uploads/' + req.file.filename : null
    });
    await post.save();
    req.flash('success', 'Post created');
    res.redirect(`/posts/${post.slug}`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/posts/new');
  }
};

exports.showPost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug }, include: [{ model: User, as: 'author' }] });
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    const comments = await Comment.findAll({ where: { postId: post.id }, include: [{ model: User, as: 'author' }], order: [['createdAt', 'DESC']] });
    res.render('posts/show', { post, comments });
  } catch (error) {
    req.flash('error', 'Error loading post');
    res.redirect('/');
  }
};

exports.renderEdit = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    if (post.authorId != req.session.user.id) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/');
    }
    res.render('posts/edit', { post });
  } catch (error) {
    req.flash('error', 'Error loading post');
    res.redirect('/');
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    if (post.authorId != req.session.user.id) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/');
    }
    
    const { title, content, tags, category, removeImage } = req.body;
    post.title = title;
    post.content = content;
    post.tags = tags ? tags.split(',').map(t => t.trim()) : [];
    post.category = category;
    
    // Handle image updates
    if (req.file) {
      post.image = '/uploads/' + req.file.filename;
    } else if (removeImage === 'on') {
      post.image = null;
    }
    
    await post.save();
    req.flash('success', 'Post updated successfully');
    res.redirect(`/posts/${post.slug}`);
  } catch (error) {
    req.flash('error', 'Error updating post');
    res.redirect('back');
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    
    // Check if user owns the post or is an admin
    if (post.authorId != req.session.user.id && req.session.user.role !== 'admin') {
      req.flash('error', 'Unauthorized');
      return res.redirect('/');
    }
    
    // Delete associated comments first
    await Comment.destroy({ where: { postId: post.id } });
    
    // Delete the post
    await post.destroy();
    
    req.flash('success', 'Post deleted successfully');
    res.redirect('/posts');
  } catch (error) {
    console.error('Delete error:', error);
    req.flash('error', 'Error deleting post');
    res.redirect('back');
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug } });
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    
    const comment = await Comment.create({
      postId: post.id,
      authorId: req.session.user ? req.session.user.id : null,
      authorName: req.body.name || (req.session.user ? req.session.user.username : 'Anonymous'),
      text: req.body.text
    });
    req.flash('success', 'Comment added');
    res.redirect(`/posts/${post.slug}`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('back');
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) {
      req.flash('error', 'Comment not found');
      return res.redirect('back');
    }

    // Allow author or admin to delete the comment
    if (comment.authorId != req.session.user.id && req.session.user.role !== 'admin') {
      req.flash('error', 'Unauthorized to delete this comment');
      return res.redirect('back');
    }

    await comment.destroy();
    req.flash('success', 'Comment deleted');
    res.redirect('back');
  } catch (error) {
    console.error('Error deleting comment:', error);
    req.flash('error', 'Failed to delete comment');
    res.redirect('back');
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.json({ ok: false, error: 'Post not found' });
    
    const uid = req.session.user.id;
    let likes = post.likes || [];
    const idx = likes.indexOf(uid);
    
    if (idx === -1) {
      likes.push(uid);
    } else {
      likes.splice(idx, 1);
    }
    
    post.likes = likes;
    post.changed('likes', true); // tell Sequelize the JSON changed
    
    await post.save();
    res.json({ ok: true, likes: post.likes.length });
  } catch (error) {
    res.json({ ok: false, error: 'Server error' });
  }
};
