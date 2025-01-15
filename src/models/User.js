// define User schema
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 }, // unique id for each user
    name: { type: String, required: true }, // user name
    age: { type: Number, required: true }, // user age
    email: { type: String, required: true, unique: true } // user email
});

// create User model
module.exports = mongoose.model('User', userSchema);
