
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var io = require('socket.io');

var app = express();

// Models
var User = require('./models/User');

// Routes
var user = require('./routes/user');
var sketch = require('./routes/sketch');

// Login
var passport = require('passport');
var auth = require('./routes/authentication/authentication.js');

mongoose.connect("mongodb://localhost/reacTag");

var db = mongoose.connection;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser({keepExtensions: true, uploadDir: path.join(__dirname, '/uploads')}));
app.use(express.methodOverride());
app.use(express.session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        if(!err) done(null, user);
        else done(err, null)
    })
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Login and Logout

app.post('/login',
    passport.authenticate('local', {
//        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true }),
    function(req, res) {
        res.redirect('/users/' + req.user._id);
    }
);

app.get('/', routes.index);

// Users

app.get('/users', user.list);
app.param('userId', user.load);
app.get('/users/:userId', user.view);

// Sketches

app.get('/sketches/new', ensureAuthenticated, sketch.new);
app.post('/sketches/submit', sketch.submit);
app.param('sketchId', sketch.load);
app.get('/sketches/:sketchId', sketch.view);
app.get('/sketches/:sketchId/info', sketch.info);
app.get('/sketches/:sketchId/download', sketch.download);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}
