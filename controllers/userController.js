const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uploadToCloudinary = require('../middleware/uploadToCloudinary');

const uploadWithRetry = async (buffer, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      if (i > 0) console.log(`Retrying upload attempt ${i}...`);
      return await uploadToCloudinary(buffer);
    } catch (err) {
      if (i === retries) throw err;
    }
  }
};

exports.registerUser = async (req, res) => {
  try {
    const {
      role = req.body.userType,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      bloodType,
      allergies,
      specialization,
      licenseNumber,
      yearsOfExperience,
      hospital,
      image: imageFromBody,
    } = req.body;

    const file = req.file;

    if (!role || !firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailNormalized = email.toLowerCase();

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (role === 'doctor') {
      if (!specialization || !licenseNumber || !yearsOfExperience || !hospital) {
        return res.status(400).json({ message: "All doctor fields are required" });
      }
    } else if (role === 'patient') {
      // Allow allergies to be empty string or null, treat undefined as missing
      if (!dateOfBirth || !bloodType || allergies === undefined) {
        return res.status(400).json({ message: "All patient fields are required" });
      }
      // Optionally: validate dateOfBirth is a valid date string
      if (isNaN(Date.parse(dateOfBirth))) {
        return res.status(400).json({ message: "Invalid dateOfBirth format" });
      }
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    let imageUrl = imageFromBody || null;
    if (file && file.buffer) {
      const result = await uploadWithRetry(file.buffer);
      imageUrl = result.secure_url;
    }

    // Parse yearsOfExperience as number (doctor only)
    const yearsOfExperienceNum = role === 'doctor' ? parseInt(yearsOfExperience, 10) : undefined;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      role,
      firstName,
      lastName,
      email: emailNormalized,
      password: hashedPassword,
      dateOfBirth: role === 'patient' ? dateOfBirth : undefined,
      bloodType: role === 'patient' ? bloodType : undefined,
      allergies: role === 'patient' ? allergies : undefined,
      specialization: role === 'doctor' ? specialization : undefined,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
      yearsOfExperience: yearsOfExperienceNum,
      hospital: role === 'doctor' ? hospital : undefined,
      image: imageUrl,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        bloodType: newUser.bloodType,
        allergies: newUser.allergies,
        specialization: newUser.specialization,
        licenseNumber: newUser.licenseNumber,
        yearsOfExperience: newUser.yearsOfExperience,
        hospital: newUser.hospital,
        image: newUser.image,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({
      message: err.message || 'Server error during registration',
    });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bloodType: user.bloodType,
        allergies: user.allergies,
        specialization: user.specialization,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getDoctor = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.status(200).json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select('-password'); // exclude password

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.status(200).json(doctor);
  } catch (err) {
    console.error('Error fetching doctor profile:', err);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password'); // exclude password

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.status(200).json(patient);
  } catch (err) {
    console.error('Error fetching patient profile:', err);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// PATCH /api/patients/:id/vitals
exports.updatePatientVitals = async (req, res) => {
  const doctorId = req.user.id; // from JWT
  const patientId = req.params.id;
  const { bloodPressure, heartRate, temperature, oxygenSaturation } = req.body;

  try {
    // Ensure doctor is logged in
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update vitals' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.vitals = {
      bloodPressure,
      heartRate,
      temperature,
      oxygenSaturation,
    };

    await patient.save();

    res.status(200).json({
      message: 'Vitals updated successfully',
      vitals: patient.vitals,
    });

  } catch (err) {
    console.error('Error updating vitals:', err);
    res.status(500).json({ message: 'Server error while updating vitals' });
  }
};