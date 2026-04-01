const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();
    res.json({ totalUsers, totalPosts, totalComments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId == req.user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Post.destroy({ where: { authorId: userId } });
    await Comment.destroy({ where: { authorId: userId } });
    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ message: `${user.username} is now an admin.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to promote user' });
  }
};
