require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { setupSocket } = require('./controllers/chatController');
const resetPasswordRoutes = require('./routes/resetPasswordRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const searchDoctorRoutes = require('./routes/searchDoctorRoutes');

const app = express();
const server = http.createServer(app);

// 🧠 Parse allowed origins from .env
const allowedOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());

// 🧠 Setup Socket.IO on correct server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ include PATCH
    credentials: true,
  },
});


setupSocket(io);

// 🗂️ Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🛡️ Helmet CSP
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...allowedOrigins],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
    },
  })
);

// ⚙️ Webhook must come before body parsers
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// 🧷 Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📦 Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/resetPassword', resetPasswordRoutes);
app.use('/api/doctors', searchDoctorRoutes);
app.get('/', (req, res) => res.send('API Running'));

app.get('/debug/env', (req, res) => {
  res.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Loaded' : '❌ Missing',
  });
});


// 🔗 MongoDB
console.log("✅ Loaded MongoDB URI:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🚀 Start HTTP server (important: use server.listen)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Server is running at http://${HOST}:${PORT}`);
});
