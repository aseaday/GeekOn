exports.ensureAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

exports.user = {
    hasAuthorization : function (req, res, next) {
      if (req.profile.username !== req.session.user.username) {
        return res.redirect('/users/'+req.profile.username);
      }
      next();
    }
};

exports.token_user = {
  hasAuthorization : function (req, res, next) {
    console.log(req.query['token']);
    if(!req.query['token'] || req.query['token'] !== req.session.user.password_reset_token) {
        return res.redirect('/users/'+req.profile.username);
    }
    next();
  }
};
