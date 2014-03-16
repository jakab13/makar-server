
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var QRCode = require('qrcode');

var Sketch = require('../models/Sketch');
var User = require('../models/User');

exports.new = function(req, res){
    res.render('sketches/new', { title: 'New Sketch', user: req.user});
};

exports.submit = function(req, res) {
    var b = req.body;
    var sketchName = req.files.sketch.name;
    var sketchId = uuid.v1();
    var tempPath = req.files.sketch.path;
    var targetPath = path.resolve('./uploads/' + sketchId);
    fs.rename(tempPath, targetPath, function(err){
            if (err) console.log(err);
        new Sketch({
            authorId: req.user.id,
            title : b.title,
            description: b.description,
            createdAt: Date.now(),
            sketchName: sketchName,
            sketchId: sketchId
        }).save(function(err, sketch) {
                if (err)
                    res.json(err);
                QRCode.save(path.resolve('./public/QRCodes/' + sketch._id + '.png'), '/sketches/' + sketch._id + '/info',
                    function(err, written){
                    if (err) console.log(err);
                    res.redirect('/sketches/' + sketch._id);
                });
            });
    });
};

exports.load = function(req, res, next, sketchId) {
    Sketch.find({
        _id : sketchId
    }, function(err, sketchDocs) {
        User.find({
            _id: sketchDocs[0].authorId
        }, function(err, userDocs) {
                fs.stat(path.resolve('./uploads/' + sketchDocs[0].sketchId), function(err, stats){
                    author = userDocs[0];
                    sketch = sketchDocs[0];
                    fileSize = stats.size;
                    next();
                });
            });
       });
};

exports.view = function(req, res) {
    res.render("sketches/view", {
        sketch : sketch,
        user: req.user
    });
};

exports.info = function(req, res)   {
    var data = {
        id: sketch._id,
        title: sketch.title,
        author: author.email,
        description: sketch.description,
        size: fileSize
    };
    res.json(data);
};

exports.download = function(req, res)   {
    var file = './uploads/' + sketch.sketchId;
    var fileName = sketch.sketchName
    res.download(file, fileName);
};

exports.update = function(req, res)    {
    var b = req.body;
    var sketchName = req.files.sketch.name;
    var sketchId = uuid.v1();
    var tempPath = req.files.sketch.path;
    var targetPath = path.resolve('./uploads/' + sketchId);
    fs.rename(tempPath, targetPath, function(err){
        if (err) console.log(err);
        Sketch.find({
            _id: sketch._id
        }, {
            title : b.title,
            description: b.description,
            createdAt: Date.now(),
            sketchName: sketchName,
            sketchId: sketchId
        }, function(err){
            res.json(err);
            res.redirect('/sketches/' + sketch._id);
        });
    });
};

exports.edit = function(req, res) {
    res.render("sketches/edit", {
        sketch : sketch,
        user: req.user
    });
};

