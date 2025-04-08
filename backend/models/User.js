const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Plain text password - HIGHLY INSECURE!
    role: { type: String, enum: ['user', 'seller'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);