// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

// Import routes
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // only user management

const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// ------------------- SOCKET.IO -------------------
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'], // frontend URL
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// ------------------- MIDDLEWARE -------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------- SESSION -------------------
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// ------------------- MONGODB -------------------
mongoose.connect('mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ DB error:', err));

// ------------------- MULTER -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    if (req.session.user) {
      const ext = path.extname(file.originalname);
      cb(null, req.session.user._id + '-' + Date.now() + ext);
    } else {
      cb(new Error('No session user found'));
    }
  }
});
const upload = multer({ storage });

// ------------------- ROUTES -------------------
app.use('/api/auth', authRoutes); // signup/login/logout
app.use('/api/users', userRoutes); // user management (get users, add friend, etc.)
app.use('/api/chat', chatRoutes);

// Profile update (with upload)
app.post('/api/users/update-profile', upload.single('profilePicFile'), async (req, res) => {
  try {
    if (!req.session.user) return res.json({ success: false, msg: 'Not logged in' });

    const { name, profilePicUrl } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (req.file) updateData.profilePic = '/uploads/' + req.file.filename;
    else if (profilePicUrl) updateData.profilePic = profilePicUrl;

    const user = await User.findByIdAndUpdate(req.session.user._id, updateData, { new: true });

    req.session.user.name = user.name;
    req.session.user.profilePic = user.profilePic;

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: 'Server error' });
  }
});

// Get current logged-in user
app.get('/api/users/current', async (req, res) => {
  if (!req.session.user) return res.json({});
  const user = await User.findById(req.session.user._id);
  res.json(user);
});

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/homepage.html'));
});

// ------------------- SOCKET.IO -------------------
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
