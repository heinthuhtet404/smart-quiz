const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ------------------ SIGNUP ------------------
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: 'Email already used' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


// ------------------ LOGIN ------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Save session
    req.session.user = { _id: user._id, name: user.name, email: user.email };

    res.json({
      success: true,
      message: "Login successful",
      redirect: "/homepage.html",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------ LOGOUT ------------------
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out successfully", redirect: "/login.html" });
  });
});

// ------------------ CURRENT USER ------------------
router.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

module.exports = router;
