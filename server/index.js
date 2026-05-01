// Server initialized with gallery assets
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
  },
  maxHttpBufferSize: 1e8 // 100MB
});

let users = {};

const messagesFilePath = path.join(__dirname, 'messages.json');
const galleryFilePath = path.join(__dirname, 'gallery.json');
const articlesFilePath = path.join(__dirname, 'articles.json');

// Initialize files if they don't exist
if (!fs.existsSync(messagesFilePath)) fs.writeFileSync(messagesFilePath, JSON.stringify([]));
if (!fs.existsSync(galleryFilePath)) fs.writeFileSync(galleryFilePath, JSON.stringify([]));
if (!fs.existsSync(articlesFilePath)) fs.writeFileSync(articlesFilePath, JSON.stringify([
  { id: 1, title: 'Tips Menjaga Mood', category: 'Health', excerpt: 'Tersenyum adalah kunci utama untuk menjaga hari tetap cerah...', content: 'Tersenyum adalah kunci utama untuk menjaga hari tetap cerah. Selain itu, jangan lupa untuk beristirahat yang cukup dan makan makanan yang bergizi. Mood yang baik akan membuat harimu lebih produktif!', date: '30 Apr', author: 'Admin' },
  { id: 2, title: 'Kisah Katmut & Betmut', category: 'Story', excerpt: 'Petualangan dimulai dari sebuah kolam kecil yang indah...', content: 'Petualangan dimulai dari sebuah kolam kecil yang indah. Katmut sang katak penurut dan Betmut sang bebek imut selalu bersama dalam suka dan duka. Mereka belajar banyak hal tentang persahabatan sejati.', date: '29 Apr', author: 'Admin' }
]));

let messageHistory = JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'));
let galleryItems = JSON.parse(fs.readFileSync(galleryFilePath, 'utf8'));
let articleItems = JSON.parse(fs.readFileSync(articlesFilePath, 'utf8'));

const saveMessages = () => fs.writeFileSync(messagesFilePath, JSON.stringify(messageHistory, null, 2));
const saveGallery = () => fs.writeFileSync(galleryFilePath, JSON.stringify(galleryItems, null, 2));
const saveArticles = () => fs.writeFileSync(articlesFilePath, JSON.stringify(articleItems, null, 2));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User registers their identity (katmut or betmut)
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} registered with socket ${socket.id}`);
    
    // Send history to the newly registered user
    socket.emit('message-history', messageHistory);
    socket.emit('gallery-history', galleryItems);
    socket.emit('article-history', articleItems);

    // Notify others that this user is online
    socket.broadcast.emit('user-online', userId);
  });

  // Gallery Events
  socket.on('add-gallery-item', (item) => {
    galleryItems.unshift(item);
    saveGallery();
    io.emit('gallery-item-added', item);
  });

  socket.on('like-gallery-item', (data) => {
    galleryItems = galleryItems.map(img => 
      img.id === data.id ? { ...img, likes: img.likes + 1 } : img
    );
    saveGallery();
    io.emit('gallery-item-updated', data.id, { type: 'like' });
  });

  socket.on('comment-gallery-item', (data) => {
    galleryItems = galleryItems.map(img => 
      img.id === data.id ? { ...img, comments: [...(img.comments || []), data.comment] } : img
    );
    saveGallery();
    io.emit('gallery-item-updated', data.id, { type: 'comment', comment: data.comment });
  });

  // Article Events
  socket.on('add-article', (article) => {
    articleItems.unshift(article);
    saveArticles();
    io.emit('article-added', article);
  });

  // Chat message relay
  socket.on('send-message', (data) => {
    const { to, message } = data;
    const targetSocket = users[to];
    
    console.log(`Message from ${data.message.sender} to ${to}`);
    
    // Save to history
    messageHistory.push(data.message);
    saveMessages();
    
    if (targetSocket) {
      io.to(targetSocket).emit('receive-message', data.message);
    }
  });

  // WebRTC Signaling
  socket.on('call-user', (data) => {
    const targetSocket = users[data.userToCall];
    if (targetSocket) {
      console.log(`Relaying call from ${data.from} to ${data.userToCall}`);
      io.to(targetSocket).emit('call-made', {
        offer: data.offer,
        from: data.from,
        type: data.type
      });
    } else {
      console.log(`Call target ${data.userToCall} not found online`);
    }
  });

  socket.on('make-answer', (data) => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      console.log(`Relaying answer from ${data.from} to ${data.to}`);
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

  // Game relay
  socket.on('game-move', (data) => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('game-move', data);
    }
  });

  socket.on('game-reset', (data) => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('game-reset');
    }
  });

  // Message modifications
  socket.on('delete-message', (data) => {
    const targetSocket = users[data.to];
    
    // Update history
    messageHistory = messageHistory.filter(m => m.id !== data.messageId);
    saveMessages();

    if (targetSocket) {
      io.to(targetSocket).emit('message-deleted', data.messageId);
    }
  });

  socket.on('edit-message', (data) => {
    const targetSocket = users[data.to];
    
    // Update history
    messageHistory = messageHistory.map(m => m.id === data.id ? { ...m, text: data.text, edited: true } : m);
    saveMessages();

    if (targetSocket) {
      io.to(targetSocket).emit('message-edited', data);
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
// Using app.use() as a catch-all middleware to avoid Express 5 wildcard syntax issues
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
