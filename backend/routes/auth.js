// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ------------------ SIGNUP ------------------
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.redirect('/signup.html?error=EmailAlreadyUsed');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.redirect('/login.html?signup=success');
  } catch (err) {
    res.redirect('/signup.html?error=' + encodeURIComponent(err.message));
  }
});

// ------------------ LOGIN ------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.redirect('/login.html?error=UserNotFound');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.redirect('/login.html?error=InvalidPassword');

    // If using session
    if (req.session) {
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email
      };
    }

    res.redirect('/homepage.html');
  } catch (err) {
    res.redirect('/login.html?error=' + encodeURIComponent(err.message));
  }
});

// ------------------ GET ALL USERS ------------------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, _id: 1 }); // return id, name, email
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// ------------------ ADD FRIEND ------------------
router.post('/add-friend', async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.friends) user.friends = [];
    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
    }

    res.json({ message: 'Friend added successfully', friends: user.friends });
  } catch (err) {
    res.status(500).json({ message: 'Error adding friend' });
  }
});

// ------------------ GET USER BY ID ------------------
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends', 'name email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

module.exports = router;
