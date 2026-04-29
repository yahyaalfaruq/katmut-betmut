import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the "dist" directory (Vite build output)
app.use(express.static(path.join(__dirname, '../dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User registers their identity (katmut or betmut)
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} registered with socket ${socket.id}`);
    
    // Notify others that this user is online
    socket.broadcast.emit('user-online', userId);
  });

  // Chat message relay
  socket.on('send-message', (data) => {
    const { to, message } = data;
    const targetSocket = users[to];
    
    console.log(`Message from ${data.message.sender} to ${to}`);
    
    // Always broadcast so both tabs get the update if needed,
    // or just send to specific target
    if (targetSocket) {
      io.to(targetSocket).emit('receive-message', data.message);
    }
  });

  // WebRTC Signaling
  socket.on('call-user', (data) => {
    const targetSocket = users[data.userToCall];
    if (targetSocket) {
      io.to(targetSocket).emit('call-made', {
        offer: data.offer,
        from: data.from
      });
    }
  });

  socket.on('make-answer', (data) => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('answer-made', {
        answer: data.answer,
        from: data.from
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('ice-candidate', {
        candidate: data.candidate,
        from: data.from
      });
    }
  });

  // End Call Signaling
  socket.on('end-call', (data) => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('call-ended');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find who disconnected
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        socket.broadcast.emit('user-offline', userId);
        break;
      }
    }
  });
});

// Handle SPA routing - send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
