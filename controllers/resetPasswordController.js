const jwt = require('jsonwebtoken');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const ParseInt = require('body-parser');
const User = require('../models/User'); // Replace with your user model

const forgotPasswordHandler = async (req, res) => {
    const { email } = req.body;
    console.log("Incoming reset request for:", email); // ✅ Step log

    try {
        // Step 1: Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log("User found:", user.email);

        // Step 2: Generate reset token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.RESET_TOKEN_EXPIRATION,
        });

        console.log("Generated reset token:", token);

        // Step 3: Setup email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // Add this line if you're using port 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        console.log("Reset URL:", resetUrl);

        // Step 4: Send the reset email
        await transporter.sendMail({
            from: `"Support Team" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>`,
        });
        console.log("Reset email sent to:", user.email);
        res.status(200).json({ message: 'Reset email sent successfully' });
    } catch (error) {
        console.error("Error in forgotPasswordHandler:", error); // ✅ Most important line
        res.status(500).json({ error: error.message });
    }
};


const resetPasswordHandler = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        // Update password
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};



module.exports = {
    forgotPasswordHandler,
    resetPasswordHandler,

}