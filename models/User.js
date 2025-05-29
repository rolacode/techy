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
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },

  // Common field
  image: {
    type: String,
    required: true,
  },

  // === PATIENT-SPECIFIC FIELDS ===
  dateOfBirth: Date,
  bloodType: String,
  allergies: String,
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
  },

  // === DOCTOR-SPECIFIC FIELDS ===
  specialization: String,
  licenseNumber: String,
  yearsOfExperience: Number,
  hospital: String,
}, { timestamps: true });


// Custom validation middleware
userSchema.pre('validate', function (next) {
  const user = this;

  if (user.role === 'patient') {
    if (!user.dateOfBirth) return next(new Error('Patient must have a date of birth.'));
    if (!user.bloodType) return next(new Error('Patient must have a blood type.'));
    if (!user.allergies) return next(new Error('Patient must specify allergies.'));
  }

  if (user.role === 'doctor') {
    if (!user.specialization) return next(new Error('Doctor must have a specialization.'));
    if (!user.licenseNumber) return next(new Error('Doctor must have a license number.'));
    if (!user.yearsOfExperience && user.yearsOfExperience !== 0) {
      return next(new Error('Doctor must have years of experience.'));
    }
    if (!user.hospital) return next(new Error('Doctor must be affiliated with a hospital.'));
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
