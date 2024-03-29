
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var util = require('util');
var mongoose = require('mongoose');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// Models
var User = require('./models/User');
var Sketch = require('./models/Sketch');

// Routes
var user = require('./routes/user');
var sketch = require('./routes/sketch');

// Login
var passport = require('passport');
var auth = require('./routes/authentication/authentication.js');

mongoose.connect("mongodb://localhost/makar");

var db = mongoose.connection;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
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
        failureRedirect: '/',
        failureFlash: true }),
    function(req, res) {
        res.redirect('/users/' + req.user._id);
    }
);

//app.post('/loginapp',
//    passport.authenticate('local', function(err, user){
//        if (!user) res.send("Kurva anyad");
//    }), function (req, res) {
//        res.redirect('/users/' + req.user._id + '/app');
//    }
//);

//app.get('/tokens',
//    passport.authenticate('bearer', { session: false }),
//    function(req, res){
//        res.json(req.user);
//    });

app.get('/', routes.index);

// Users

app.get('/users', user.list);
app.param('userId', user.load);
app.get('/users/:userId', user.view);
app.get('/users/:userId/app', user.viewapp);

// Sketches

app.get('/sketches/new', ensureAuthenticated, sketch.new);
app.post('/sketches/submit', sketch.submit);
//app.post('/sketches/register', sketch.register);
app.post('/sketches/update', sketch.update);
app.param('sketchId', sketch.load);
app.get('/sketches/:sketchId', sketch.view);
app.get('/sketches/:sketchId/info', sketch.info);
app.get('/sketches/:sketchId/download', sketch.download);
app.get('/sketches/:sketchId/edit', sketch.edit);

// QR code

app.get('/QRCodes/:sketchId/download', sketch.downloadQR);

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});

server.listen(3000);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

io.sockets.on('connection', function (socket) {
    socket.on('room', function(room){
        socket.join(room);

        socket.on('get inits', function(){
            Sketch.find({
                _id: room
            }, function(err, docs){
                var variables = docs[0].variables;
                if (variables) {
                    socket.emit('get inits', variables);
                }
            });
        });

        socket.on('set variable', function(data){
            console.log(data);
            var isPersistent = data.isPersistent;
            var name = data.name;
            var value = data.value;
            socket.broadcast.to(room).emit('set variable', name + value);
            if (isPersistent) {
                Sketch.findOne({
                   _id: room
                }, 'variables', function(err, sketch){
                    var variables = sketch.variables;
                    if(variables === undefined) {variables = {}}
                    variables[name] = value;
                    Sketch.update({
                        _id: room
                    }, {$set: {variables: variables}}, {upsert: true}, function(err){
                        if (err) console.log(err);
                    });
                });
            }
        });
    });
});
