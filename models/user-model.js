const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String,  required: true},
    isActivated: {type: Boolean,  default: false},
    activationLink: {type: String},
    name: {type: String, required: true},
    surName: {type: String, required: true},
    role: {type: String, require: true},
    avatar: {type: String, require: true},
})

module.exports = model('User', UserSchema);