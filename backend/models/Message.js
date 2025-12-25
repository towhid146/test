const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "sender.role",
      },
      role: {
        type: String,
        enum: ["Sponsor", "Sponsee"],
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    receiver: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "receiver.role",
      },
      role: {
        type: String,
        enum: ["Sponsor", "Sponsee"],
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create conversation ID from two user IDs (always sorted for consistency)
messageSchema.statics.createConversationId = function (userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return sortedIds.join("_");
};

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ "sender.id": 1, read: 1 });
messageSchema.index({ "receiver.id": 1, read: 1 });

module.exports = mongoose.model("Message", messageSchema);
