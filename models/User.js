const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['doctor', 'patient'],
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    dateOfBirth: {
    type: Date,
    required: function() {
        return this.role === 'patient';
    }
    },
    // Patient-specific fields
    bloodType: {
        type: String,
        required: function() {
            return this.role === 'patient';
        }
    },
    allergies: {
        type: String,
        required: function() {
            return this.role === 'patient';
        }
    },
    // Doctor-specific fields
    specialization: {
        type: String,
        required: function() {
            return this.role === 'doctor';
        }
    },
    licenseNumber: {
        type: String,
        required: function() {
            return this.role === 'doctor';
        }
    },
    yearsOfExperience: {
        type: Number,
        required: function() {
            return this.role === 'doctor';
        }
    },
    hospital: {
        type: String,
        required: function() {
            return this.role === 'doctor';
        }
    },
    // Common field
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
