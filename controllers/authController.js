const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.submitRegister = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = User.build({ username, email, password });
    await user.save();
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role }, message: 'Registered and logged in' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.submitLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role }, message: 'Logged in' });
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out' });
};

exports.getMe = (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
};
