
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
        sketch = sketchDocs[0];
        next();
       });
};

exports.view = function(req, res) {
    res.render("sketches/view", {
        sketch : sketch,
        user: req.user
    });
};

exports.info = function(req, res)   {
    res.json(sketch);
};

exports.download = function(req, res)   {
    var file = './uploads/' + sketch.sketchId;
    var fileName = sketch.sketchName
    res.download(file, fileName);
};

