const express = require('express');
const router = express.Router();

module.exports = (authDB) => {
  const User = require('../models/User')(authDB);

  // -------- SEND FRIEND REQUEST --------
  router.post('/send-request', async (req, res) => {
    const { fromUserId, toUserId } = req.body;
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    try {
      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);

      if (!fromUser || !toUser) return res.status(404).json({ message: 'User not found' });

      // Prevent sending to self
      if (fromUserId === toUserId) return res.status(400).json({ message: 'Cannot send request to yourself' });

      // Check if already friends or request already sent
      if (toUser.friendRequests.includes(fromUserId) || toUser.friends.includes(fromUserId)) {
        return res.status(200).json({ message: 'Already sent or already friends' });
      }

      toUser.friendRequests.push(fromUserId);
      await toUser.save();

      res.status(200).json({ message: 'Friend request sent!' });
    } catch (err) {
      console.error('Error sending friend request:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // -------- GET PENDING FRIEND REQUESTS --------
  router.get('/requests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).populate('friendRequests', 'name email profilePic');
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.status(200).json(user.friendRequests);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // -------- ACCEPT FRIEND REQUEST --------
  router.post('/accept-request', async (req, res) => {
    const { userId, requesterId } = req.body;
    if (!userId || !requesterId) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    try {
      const user = await User.findById(userId);
      const requester = await User.findById(requesterId);
      if (!user || !requester) return res.status(404).json({ message: 'User not found' });

      // Add each other as friends if not already
      if (!user.friends.includes(requesterId)) user.friends.push(requesterId);
      if (!requester.friends.includes(userId)) requester.friends.push(userId);

      // Remove from pending requests
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);

      await user.save();
      await requester.save();

      res.status(200).json({ message: 'Friend request accepted!', friends: user.friends });
    } catch (err) {
      console.error('Error accepting friend request:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // -------- SEARCH USERS BY USERNAME --------
  router.get('/search/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const users = await User.find({ name: new RegExp(username, 'i') }).select('name email profilePic');
      res.status(200).json(users);
    } catch (err) {
      console.error('Error searching users:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};
