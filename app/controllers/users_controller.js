var mongoose = require('mongoose');
var User = mongoose.model('User');
var Email = require('../mailers/email');
var _ = require('underscore');

exports.user = function (req, res, next, id) {
  User.load(id, function (err, user) {
    if (err) return next(err);
    if (!user) return res.render('404');
    req.profile = user;
    next();
  });
};

exports.signin = function (req, res) {};

exports.authCallback = function (req, res, next) {
  req.flash('success','Signup');
  req.session.user = req.user;
  req.user = null;
  res.redirect('/');
};

exports.show = function (req, res) {
  res.render('users/show', {
    profile: req.profile,
    title: '账户'});
};

exports.new = function (req, res) {
  res.render('users/new', {
    title: '注册',
    user: new User({})
  });
};

exports.create = function (req, res, next) {
  var user = new User({
    uname: req.body.username,
    password: req.body.password,
    uemail: req.body.email
  });

  console.log(user);
  user.validateUsername(function (err, isValid, message) {
    if (err) return next(err);
    if (!isValid) {
      req.flash('error', message);
      return res.redirect('/signup');
    }

    user.validateEmail(function (err, isValid, message) {
      if (err) return next(err);
      if (!isValid) {
        req.flash('error', message);
        return res.redirect('/signup');
      }

      if (user.password.length < 6) {
        req.flash('error', '请设置6位以上的口令');
        return res.redirect('/signup');
      }

      if (req.body["password_confirmation"] !== user.password) {
        req.flash('error', '两次输入的口令不一致！');
        return res.redirect('/signup');
      }

      user.provider = 'local';
      user.save(function (err) {
        if (err) return next(err);
        Email.send_email;
        req.logIn(user, function(err) {
          if (err) return next(err);
          req.flash('success','注册成功！');
          req.session.user = user;
          return res.redirect('/user/'+ user.username);
        });
      });
    });
  });
};

exports.index = function(req, res){
  var page = req.param('page') > 0 ? req.param('page') : 0;
  var perPage = 2;
  var options = {
    perPage: perPage,
    page: page
  };

  User.list(options, function(err, users) {
    if (err) return res.render('500');
    User.count(
               function (err, count) {
                res.render('users/index', {
                  title: 'List of Users',
                  users: users,
                  page: page,
                  pages: count / perPage
                });
              });
  });
};

exports.edit = function (req, res) {
 res.render('users/edit', {
  title: 'Edit '+req.profile.name,
  profile: req.profile
});
};

exports.update = function (req, res) {
  console.log(req.session.user);
  var user = req.session.user
  user = _.extend(user, req.body)

 user.save(function (err, user) {
    if (err) {
      res.render('users/edit', {
        title: 'Edit user',
        user: user,
        errors: err.errors
      })
    }
    else {
      res.redirect('/user/' + user.username)
    }
  })
};
