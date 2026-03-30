module.exports = function requireAdmin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in');
    return res.redirect('/auth/login');
  }
  
  if (req.session.user.role !== 'admin') {
    req.flash('error', 'Access denied. Admins only.');
    return res.redirect('/');
  }
  
  next();
};
