const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'users',
                public_id: uuidv4(),
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;
