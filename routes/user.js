var User = require('./../models/User');
var Sketch = require('./../models/Sketch');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.load = function(req, res, next, userId) {
        User.find({
            _id : userId
        }, function(err, userDocs) {
            Sketch.find({
                authorId: userDocs[0]._id
            }, function(err, sketchDocs){
                sketches = sketchDocs;
                user = userDocs[0];
                next();
            });
        });
};

exports.view = function(req, res) {
    res.render("users/view", {
        sketches: sketches,
        user : user
    });
};

exports.viewapp = function(req, res) {
    res.json({
        sketches: sketches,
        user : user
    });
};