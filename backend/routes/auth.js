const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Export a function to accept the DB connection
module.exports = (authDB) => {
  // Use the connection to get the User model
  const User = require('../models/User')(authDB);

  // Multer setup for profile pic uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });

  // -------- SIGNUP --------
  router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).send('All fields required');

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).send('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
      res.redirect('/login.html');
    } catch (err) {
      res.status(500).send('Error: ' + err.message);
    }
  });

  // -------- LOGIN --------
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email & password required');

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send('User not found');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).send('Invalid credentials');

      res.redirect(`/homepage.html?name=${encodeURIComponent(user.name)}&id=${user._id}`);
    } catch (err) {
      res.status(500).send('Server error: ' + err.message);
    }
  });

  // -------- GET ALL USERS --------
  router.get('/users', async (req, res) => {
    try {
      const users = await User.find({}, { name: 1, _id: 1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

  // -------- ADD FRIEND --------
  router.post('/add-friend', async (req, res) => {
    const { userId, friendId } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        await user.save();
      }

      res.json({ message: 'Friend added successfully', friends: user.friends });
    } catch (err) {
      res.status(500).json({ message: 'Error adding friend' });
    }
  });

  // -------- GET SINGLE USER WITH FRIENDS --------
  router.get('/user/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('friends', 'name email profilePic');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });

  // -------- UPDATE USER (profile) --------
  router.post('/update-user', upload.single('profilePic'), async (req, res) => {
    const { userId, name, email } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.name = name || user.name;
      user.email = email || user.email;
      if (req.file) user.profilePic = `/uploads/${req.file.filename}`;

      await user.save();
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  });

  return router;
};
