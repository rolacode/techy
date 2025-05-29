const express = require('express');
const { registerUser, login, getDoctor, updatePatientVitals, getPatientProfile, } = require('../controllers/userController');
const multer = require('../middleware/multer');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', multer.single('image'), registerUser);
router.post('/login', login);
router.get('/doctors', getDoctor);
router.get('/patient/profile', protect, getPatientProfile);
router.patch('/patients/:id/vitals', protect, updatePatientVitals);


module.exports = router;
