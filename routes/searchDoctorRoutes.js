const express = require('express');
const router = express.Router();
const { searchDoctorHandler } = require('../controllers/searchDoctorController');

// POST /search-doctors
router.post('/search', searchDoctorHandler);

module.exports = router;