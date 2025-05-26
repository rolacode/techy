const express = require('express');
const { registerUser, login, getDoctor } = require('../controllers/userController');
const multer = require('../middleware/multer');
const router = express.Router();

router.post('/register', multer.single('image'), registerUser);
router.post('/login', login);
router.get('/doctors', getDoctor);

module.exports = router;
