const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  const posts = await Post.findAll({ where: { authorId: user.id }, order: [['createdAt', 'DESC']] });
  res.render('users/profile', { user, posts });
};

exports.updateProfile = async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  user.bio = req.body.bio || user.bio;
  if (req.file) user.profileImage = '/uploads/' + req.file.filename;
  await user.save();
  req.flash('success', 'Profile updated');
  res.redirect('/users/profile');
};
