const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'email', 'bio', 'profileImage', 'role', 'createdAt']
  });
  const posts = await Post.findAll({ where: { authorId: user.id }, order: [['createdAt', 'DESC']] });
  res.json({ user, posts });
};

exports.updateProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  user.bio = req.body.bio || user.bio;
  if (req.file) user.profileImage = '/uploads/' + req.file.filename;
  await user.save();
  res.json({ message: 'Profile updated', user: { id: user.id, username: user.username, bio: user.bio, profileImage: user.profileImage } });
};
