var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: {type: String , lowercase: true, required: true, index: {unique: true}},
    password: {type: String, required: true},
    createdAt : Date
});

var User = mongoose.model('User', UserSchema);

module.exports = User;