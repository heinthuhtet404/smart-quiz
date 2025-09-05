// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },

    // Message content
    text: { type: String, trim: true },
    fileUrl: { type: String },
    fileType: { 
      type: String, 
      enum: ["image", "video", "audio", "document", "other"], 
      default: "other" 
    },

    // Reply feature
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

// Optional: virtual to detect actual type if fileType is not explicitly set
messageSchema.virtual("fileCategory").get(function() {
  if (!this.fileUrl) return null;
  if (this.fileType) return this.fileType;
  const ext = this.fileUrl.split(".").pop().toLowerCase();
  if (["png","jpg","jpeg","gif"].includes(ext)) return "image";
  if (["mp4","mov","webm"].includes(ext)) return "video";
  if (["mp3","wav"].includes(ext)) return "audio";
  return "document";
});

module.exports = mongoose.model("Message", messageSchema);
