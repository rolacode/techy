require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { setupSocket } = require('../controllers/chatController');
const resetPasswordRoutes = require('../routes/resetPasswordRoutes');
const userRoutes = require('../routes/userRoutes');
const appointmentRoutes = require('../routes/appointmentRoutes');
const chatRoutes = require('../routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

setupSocket(io);

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true, // important: sets sane defaults like script-src, img-src, etc.
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://infragrid.v.network'], // THIS line is what enables fetch/ajax to that domain
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
        },
    })
);

app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/resetPassword', resetPasswordRoutes);

app.get('/', (req, res) => res.send('API Running'));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // 👈 This is important for Render/Docker

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

