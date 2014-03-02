var User = require('./../models/User');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.load = function(req, res, next, userId) {
        User.find({
            _id : userId
        }, function(err, userDocs) {
            user = userDocs[0];
            next();
           });
};

exports.view = function(req, res) {
    res.render("users/view", {
        user : user
    });
};