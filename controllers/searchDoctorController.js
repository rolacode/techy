const User = require("../models/User");

const searchDoctorHandler = async (req, res) => {
  try {
    const { symptom } = req.query; // ✅ Use req.query instead of req.body

    const symptomMap = {
      fever: "General Practice",
      rash: "Dermatology",
      chestpain: "Cardiology",
      headache: "Neurology",
      anxiety: "Psychiatry",
      bonepain: "Orthopedics",
      childfever: "Pediatrics",
      cancerscreening: "Oncology",
    };

    const specialization = symptomMap[symptom?.toLowerCase()];
    if (!specialization) {
      return res
        .status(404)
        .json({ message: "No specialization found for that symptom." });
    }

    const doctors = await User.find({ role: "doctor", specialization });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Search Doctor Error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

module.exports = {
  searchDoctorHandler,
};
