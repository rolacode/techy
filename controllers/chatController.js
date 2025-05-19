let users = {};

exports.setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join', ({ userId }) => {
            users[userId] = socket.id;
            console.log(`User ${userId} joined with socket ${socket.id}`);
        });

        socket.on('send_message', ({ toUserId, message, fromUserId }) => {
            const receiverSocketId = users[toUserId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', { message, fromUserId });
            }
        });

        socket.on('disconnect', () => {
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    break;
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });
};
