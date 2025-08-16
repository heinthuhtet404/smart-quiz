const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Get all messages
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ✅ Save new message with optional file
router.post('/', upload.single('file'), async (req, res) => {
  const { senderId, receiverId, senderName, text } = req.body;
  let fileUrl = null;
  let fileType = null;

  if (req.file) {
    fileUrl = `http://localhost:5000/uploads/${req.file.filename}`; // serve files
    fileType = req.file.mimetype;
  }

  if (!senderId || !receiverId || !senderName || (!text && !fileUrl)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newMessage = new Message({ senderId, receiverId, senderName, text, fileUrl, fileType });
    await newMessage.save();

    // ✅ Emit to all connected sockets (optional: only to specific users)
    req.app.get('io')?.emit('newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;