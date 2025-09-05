const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (authDB) => {
  const User = require('../models/User')(authDB);

  // --- Multer storage for profile pictures ---
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads/profiles');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // --- Signup ---
  router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: 'User registered successfully', userId: user._id, name: user.name });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error during signup' });
    }
  });

  // --- Login ---
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      res.status(200).json({
        message: 'Login successful',
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          friends: user.friends,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  // --- Get all users ---
  router.get('/users', async (req, res) => {
    try {
      const users = await User.find({}, { name: 1, email: 1, profilePic: 1 });
      res.status(200).json(users);
    } catch (err) {
      console.error('Fetch users error:', err);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

  // --- Get single user with friends ---
  router.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id).populate('friends', 'name email profilePic');
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.status(200).json(user);
    } catch (err) {
      console.error('Fetch user error:', err);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });

  // --- Add friend manually (used after accepting friend request or searching) ---
  router.post('/add-friend', async (req, res) => {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) return res.status(400).json({ message: 'userId & friendId required' });

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        await user.save();
      }

      res.status(200).json({ message: 'Friend added successfully', friends: user.friends });
    } catch (err) {
      console.error('Add friend error:', err);
      res.status(500).json({ message: 'Error adding friend' });
    }
  });

  // --- Update user profile ---
  router.post('/update-user', upload.single('profilePic'), async (req, res) => {
    const { userId, name, email } = req.body;
    if (!userId || !name || !email) return res.status(400).json({ success: false, message: 'All fields are required' });

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.name = name;
      user.email = email;

      if (req.file) {
        if (user.profilePic && user.profilePic.startsWith(`${req.protocol}://${req.get('host')}/uploads/profiles/`)) {
          const oldFile = path.join(__dirname, '../uploads/profiles', path.basename(user.profilePic));
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }
        user.profilePic = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;
      }

      await user.save();
      res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  });

  return router;
};
