var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: {
        type: String ,
        lowercase: true,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
    },
    token: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;