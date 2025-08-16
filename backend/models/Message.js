const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  senderName: String,
  text: String,
  fileUrl: String,     // ✅ new field
  fileType: String,    // ✅ new field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
