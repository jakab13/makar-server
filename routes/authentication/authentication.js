// Module dependencies
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var crypto = require('crypto');
// Models
var User = require('./../../models/User.js');

module.exports = passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(email, password, done) {
//    var hashedPassword = crypto.pbkdf2Sync(password, this.salt, 10000, 512);
	User.findOne({
		email : email
	}, function(err, user) {
		if (err) {
			console.log(err);
		}
		if (!err && user != null) {
			done(null, user);
		} else {
			new User({
                email: email,
                password: password,
                token: crypto.randomBytes(32).toString('base64'),
				createdAt : Date.now()
			}).save(function(err) {
				if (err) {
					console.log(err);
				} else {
					done(null, user);
				}
			});
		}
	});
}));

//passport.use(new
//    BearerStrategy(
//    function(token, done) {
//        User.findOne({ token: token }, function (err, user) {
//            console.log(err);
//            console.log(user);
//            console.log(token);
//            if (err) {
//                return done(err);
//            }
//            if (!user) {
//                return done(null, false);
//            }
//            return done(null, user, { scope: 'all' });
//        });
//    }
//));