const express = require('express');
const { forgotPasswordHandler, resetPasswordHandler } = require('../controllers/resetPasswordController');

const router = express.Router();

// Request password reset
router.post('/forgot-password', forgotPasswordHandler);

// Reset password
router.post('/reset-password/:token', resetPasswordHandler);

module.exports = router;
