const express = require('express');
const { registerUser, login, getDoctor, getDoctorProfile, updatePatientVitals, getPatientProfile, } = require('../controllers/userController');
const multer = require('../middleware/multer');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

console.log('getPatientProfile:', getPatientProfile);
console.log('protect:', protect);

router.post('/register', multer.single('image'), registerUser);
router.post('/login', login);
router.get('/doctors', getDoctor);
router.get('/patient/profile', protect, (req, res, next) => {
  console.log("✅ /patient/profile route hit");
  next();
}, getPatientProfile);
router.get('/doctor/profile', protect, (req, res, next) => {
    console.log("✅ /doctor/profile route hit");
    next();
    }, getDoctorProfile);
router.patch('/patients/:id/vitals', protect, updatePatientVitals);

module.exports = router;
