const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get messages between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 }).populate('replyTo');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send new message
router.post('/', upload.single('file'), async (req, res) => {
  const { senderId, receiverId, senderName, text, replyTo } = req.body;

  let fileUrl = null;
  let fileType = null;

  if (req.file) {
    const host = req.get('host');
    const protocol = req.protocol;
    fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    fileType = req.file.mimetype;
  }

  if (!senderId || !receiverId || !senderName || (!text && !fileUrl)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newMessage = new Message({ senderId, receiverId, senderName, text, fileUrl, fileType, replyTo });
    await newMessage.save();

    req.app.get('io')?.emit('newMessage', await newMessage.populate('replyTo'));

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Edit message
router.put('/:id', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text && !req.file) return res.status(400).json({ error: 'Text or file is required to edit' });

  try {
    const updateData = { updatedAt: Date.now() };
    if (text) updateData.text = text;

    if (req.file) {
      const host = req.get('host');
      const protocol = req.protocol;
      updateData.fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      updateData.fileType = req.file.mimetype;
    }

    const updatedMessage = await Message.findByIdAndUpdate(id, updateData, { new: true }).populate('replyTo');

    req.app.get('io')?.emit('updateMessage', updatedMessage);

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);

    req.app.get('io')?.emit('deleteMessage', deletedMessage);

    res.json({ message: 'Message deleted', id });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
