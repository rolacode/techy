const User = require("../models/User");

// POST /search-doctors
const searchDoctorHandler = async (req, res) => {
  const { symptom } = req.body;

  const symptomMap = {
    fever: "General Practice",
    rash: "Dermatology",
    chestPain: "Cardiology",
    headache: "Neurology",
    anxiety: "Psychiatry",
    bonePain: "Orthopedics",
    childFever: "Pediatrics",
    cancerScreening: "Oncology",
  };

  const specialization = symptomMap[symptom.toLowerCase()];
  if (!specialization) {
    return res.status(404).json({ message: "No specialization found for that symptom." });
  }

  try {
    const doctors = await User.find({ role: "doctor", specialization });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};

module.exports = {
  searchDoctorHandler,
};
