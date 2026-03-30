const User = require('../models/User');

exports.renderRegister = (req, res) => res.render('auth/register');

exports.submitRegister = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = User.build({ username, email, password });
    await user.save();
    req.session.user = { id: user.id, username: user.username, role: user.role };
    req.flash('success', 'Registered and logged in');
    res.redirect('/');
  } catch (e) {
    req.flash('error', 'Error: ' + e.message);
    res.redirect('/auth/register');
  }
};

exports.renderLogin = (req, res) => res.render('auth/login');

exports.submitLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }
  req.session.user = { id: user.id, username: user.username, role: user.role };
  req.flash('success', 'Logged in');
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
