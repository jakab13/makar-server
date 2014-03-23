var mongoose = require('mongoose');

var SketchSchema = new mongoose.Schema({
    authorId : String,
    title: String,
    description: String,
    sketchName: String,
    sketchId: String,
    createdAt: {type: Date, default: Date.now},
    variables: {}
});

var Sketch = mongoose.model('Sketch', SketchSchema);

module.exports = Sketch;
