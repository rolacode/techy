// middleware/multer.js
const multer = require("multer");
const path = require("path");

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        cb(new Error("Only .jpg, .jpeg, .png formats are supported"), false);
    } else {
        cb(null, true);
    }
};

module.exports = multer({ storage, fileFilter });
