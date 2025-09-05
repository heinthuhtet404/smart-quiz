// routes/Chat.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (chatDB) => {
  const router = express.Router();
  const Message = require('../models/Message'); // Use default mongoose model (chatDB connection not needed here)

  // --- Multer setup for file uploads ---
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // --- GET messages between two users ---
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
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // --- POST new message ---
  router.post('/', upload.single('file'), async (req, res) => {
    const { senderId, receiverId, senderName, text, replyTo } = req.body;
    if (!senderId || !receiverId || !senderName || (!text && !req.file)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      // Determine file type category
      if (req.file.mimetype.startsWith('image/')) fileType = 'image';
      else if (req.file.mimetype.startsWith('video/')) fileType = 'video';
      else if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';
      else fileType = 'document';
    }

    try {
      const newMessage = new Message({ senderId, receiverId, senderName, text, fileUrl, fileType, replyTo });
      await newMessage.save();

      const io = req.app.get('io');
      if (io) io.emit('newMessage', await newMessage.populate('replyTo'));

      res.status(201).json(newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });

  // --- PUT update message ---
  router.put('/:id', upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text && !req.file) return res.status(400).json({ error: 'Text or file is required to edit' });

    try {
      const updateData = { updatedAt: Date.now() };
      if (text) updateData.text = text;

      if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        updateData.fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        if (req.file.mimetype.startsWith('image/')) updateData.fileType = 'image';
        else if (req.file.mimetype.startsWith('video/')) updateData.fileType = 'video';
        else if (req.file.mimetype.startsWith('audio/')) updateData.fileType = 'audio';
        else updateData.fileType = 'document';
      }

      const updatedMessage = await Message.findByIdAndUpdate(id, updateData, { new: true }).populate('replyTo');

      const io = req.app.get('io');
      if (io) io.emit('updateMessage', updatedMessage);

      res.json(updatedMessage);
    } catch (err) {
      console.error('Error updating message:', err);
      res.status(500).json({ error: 'Failed to update message' });
    }
  });

  // --- DELETE message ---
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deletedMessage = await Message.findByIdAndDelete(id);

      const io = req.app.get('io');
      if (io) io.emit('deleteMessage', deletedMessage);

      res.json({ message: 'Message deleted', id });
    } catch (err) {
      console.error('Error deleting message:', err);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  });

  return router;
};
