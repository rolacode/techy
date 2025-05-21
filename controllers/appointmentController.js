const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.bookAppointment = async (req, res) => {
  const { doctorId, symptoms, preferredDate } = req.body;
  const patientId = req.user.id;

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ error: 'Invalid doctor selected' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      symptoms,
      preferredDate,
    });

    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
