// models/User.js
const mongoose = require("mongoose");

module.exports = (connection) => {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]
  }, { timestamps: true });

  // Prevent model overwrite issues on multiple connections
  return connection.models.User || connection.model("User", userSchema);
};
