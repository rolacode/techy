const express = require('express');
const router = express.Router();

const {
  bookAppointment,
  getDoctorAppointments,
  respondToAppointment,
  getPatientAppointmentHistory,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/book', protect, bookAppointment);
router.get('/history', protect, getPatientAppointmentHistory);
router.get('/doctor', protect, getDoctorAppointments);
router.put('/respond/:appointmentId', protect, respondToAppointment);

module.exports = router;
