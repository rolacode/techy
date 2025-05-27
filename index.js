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

const app = express();
const server = http.createServer(app);

// 🧠 Setup Socket.IO on correct server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
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
      connectSrc: ["'self'", 'http://localhost:5173'], // fixed: allow local dev
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
    },
  })
);

// ⚙️ Webhook must come before body parsers
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// 🧷 Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
app.get('/', (req, res) => res.send('API Running'));

// 🔗 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 🚀 Start HTTP server (important: use server.listen)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Server is running at http://${HOST}:${PORT}`);
});
