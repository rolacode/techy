const Message = require('../models/Message');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join', ({ userId }) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('private_message', async ({ sender, receiver, content, appointmentId }) => {
      const message = new Message({ sender, receiver, content, appointment: appointmentId });
      await message.save();

      io.to(receiver).emit('receive_message', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocket };
