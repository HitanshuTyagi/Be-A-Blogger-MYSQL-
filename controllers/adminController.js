const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();

    res.render('admin/dashboard', {
      totalUsers,
      totalPosts,
      totalComments
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load dashboard data');
    res.redirect('/');
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.render('admin/users', { users });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load users');
    res.redirect('/admin');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId == req.session.user.id) {
        req.flash('error', 'You cannot delete yourself.');
        return res.redirect('/admin/users');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    // Deleting a user should ideally delete their posts and comments too (Cascade delete). 
    // Assuming Sequelize associations handle this, otherwise manual deletion is needed.
    await Post.destroy({ where: { authorId: userId } });
    await Comment.destroy({ where: { authorId: userId } });
    await user.destroy();

    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    user.role = 'admin';
    await user.save();

    req.flash('success', `${user.username} is now an admin.`);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to promote user');
    res.redirect('/admin/users');
  }
};
