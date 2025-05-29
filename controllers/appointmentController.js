const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.bookAppointment = async (req, res) => {
  const { doctorId, symptoms, preferredDate } = req.body;
  const patientId = req.user.id;

  try {
    // Validate doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ error: 'Selected doctor is invalid or not found.' });
    }

    // Validate preferred date is not in the past
    const today = new Date();
    const selectedDate = new Date(preferredDate);
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Preferred date must be today or in the future.' });
    }

    // Check for duplicate appointment
    const existing = await Appointment.findOne({
      patient: patientId,
      doctor: doctorId,
      preferredDate: selectedDate
    });

    if (existing) {
      return res.status(400).json({
        error: 'You already have an appointment with this doctor on that date.'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      symptoms,
      preferredDate: selectedDate,
      status: 'pending'
    });

    // Proper population using findById
    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'firstName lastName email specialization')
      .populate('patient', 'firstName lastName email');

    res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment: populated,
    });

  } catch (err) {
    console.error('Appointment booking error:', err);
    res.status(500).json({ error: 'Server error while booking appointment. Please try again later.' });
  }
};



exports.getDoctorAppointments = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({ doctor: doctorId }).populate('patient', 'firstName lastName email');
    res.status(200).json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.respondToAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { status, responseMessage } = req.body;

  try {
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
      responseMessage,
    }, { new: true });

    res.status(200).json({ message: 'Response sent', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route GET /api/appointments/history
// @access Private (patients)
exports.getPatientAppointmentHistory = async (req, res) => {
  const patientId = req.user.id;

  try {
    const history = await Appointment.find({ patient: patientId })
      .sort({ preferredDate: -1 }) // most recent first
      .populate('doctor', 'firstName lastName email specialization');

    res.status(200).json({ history });
  } catch (err) {
    console.error('Error fetching appointment history:', err);
    res.status(500).json({ error: 'Server error while fetching appointment history.' });
  }
};
