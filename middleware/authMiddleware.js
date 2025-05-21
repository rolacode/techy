const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If token is missing
  if (!token) {
    console.warn("Protect middleware: No token provided");
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Ensure secret is loaded
    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not defined in environment variables");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find user by ID in token payload
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn("Protect middleware: No user found with ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
