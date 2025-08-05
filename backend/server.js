const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');              // ✅ New
const { Server } = require('socket.io');   // ✅ New

const app = express();
const server = http.createServer(app);     // ✅ Create HTTP server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://192.168.100.8:5173'], // add your frontend URLs
    methods: ['GET', 'POST']
  }
});


app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect('mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB error:', err));

// ✅ Define schema/model
const messageSchema = new mongoose.Schema({
  senderId: String,
  senderName: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// ✅ Get all messages
app.get('/api/chat', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 1 });
  res.json(messages);
});

// ✅ Receive new message
app.post('/api/chat', async (req, res) => {
  const { senderId, senderName, text } = req.body;
  if (!senderId || !senderName || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newMessage = new Message({ senderId, senderName, text });
  await newMessage.save();

  // ✅ Send to all connected clients via Socket.IO
  io.emit('newMessage', newMessage);

  res.status(200).json(newMessage);
});

// ✅ Socket.IO connection
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ✅ Start server
server.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
