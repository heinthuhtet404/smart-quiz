const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// --- Dummy users for testing ---
const dummyUsers = [
  { _id: new mongoose.Types.ObjectId(), name: "Alice", email: "alice@test.com", password: "123456" },
  { _id: new mongoose.Types.ObjectId(), name: "Bob", email: "bob@test.com", password: "123456" }
];

// Seed dummy users if DB is empty
async function seedDummyUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany(dummyUsers);
    console.log("Dummy users inserted:", dummyUsers);
  }
}
seedDummyUsers();

// Create or get conversation between two users
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) return res.status(400).json({ error: "senderId and receiverId are required" });

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) return res.status(404).json({ error: "User not found" });

    let conversation = await Conversation.findOne({ members: { $all: [senderId, receiverId] } });
    if (!conversation) {
      conversation = new Conversation({ members: [senderId, receiverId] });
      await conversation.save();
    }

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/conversations/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const conversations = await Conversation.find({ members: { $in: [userId] } }).populate("members", "name");
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

module.exports = router;
