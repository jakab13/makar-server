var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./../../models/User.js');

module.exports = passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(email, password, done) {
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