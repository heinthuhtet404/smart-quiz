require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// --- Routes ---
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRequests');
const chatRoutesFactory = require('./routes/Chat'); // factory function that takes chatDB

// --- MongoDB Connections ---
const chatDB = mongoose.createConnection(process.env.CHAT_DB_URI || 'mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
chatDB.on('connected', () => console.log('✅ MongoDB (chat-app) connected'));
chatDB.on('error', (err) => console.log('❌ DB error (chat-app):', err));

const authDB = mongoose.createConnection(process.env.AUTH_DB_URI || 'mongodb://localhost:27017/auth-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
authDB.on('connected', () => console.log('✅ MongoDB (auth-app) connected'));
authDB.on('error', (err) => console.log('❌ DB error (auth-app):', err));

const app = express();
const server = http.createServer(app);

// --- Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
app.set('io', io);

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve static frontend pages ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));

// --- API Routes ---
app.use('/api/chat', chatRoutesFactory(chatDB)); // pass chatDB to Chat.js
app.use('/api/users', userRoutes(authDB));
app.use('/api/friends', friendRoutes(authDB));

// --- Root route ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

// --- Socket.IO events ---
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

module.exports = { chatDB, authDB };
