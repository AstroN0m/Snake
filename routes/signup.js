var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var sanitizer = require('sanitizer');

exports.get = function(req, res) {
    res.render('signup');
};

exports.post = function(req, res, next) {
    var username = sanitizer.escape(req.body.username);
    var password = req.body.password;
    var color = req.body.color;

    User.signup(username, password, color, function(err, user) {
        if (err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        req.session.user = user._id;
        res.send({});

    });

};