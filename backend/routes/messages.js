const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Sponsor = require("../models/Sponsor");
const Sponsee = require("../models/Sponsee");
const { authMiddleware } = require("../middleware/auth");

// Get all conversations for current user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find all unique conversations
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ "sender.id": userId }, { "receiver.id": userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver.id", userId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Format conversations
    const conversations = messages.map((msg) => {
      const lastMsg = msg.lastMessage;
      const otherUser =
        lastMsg.sender.id.toString() === userId.toString()
          ? lastMsg.receiver
          : lastMsg.sender;

      return {
        conversationId: msg._id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          role: otherUser.role,
        },
        lastMessage: {
          content: lastMsg.content,
          createdAt: lastMsg.createdAt,
          isFromMe: lastMsg.sender.id.toString() === userId.toString(),
        },
        unreadCount: msg.unreadCount,
      };
    });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
});

// Get messages for a specific conversation
router.get("/conversation/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of this conversation
    const conversationUserIds = conversationId.split("_");
    if (!conversationUserIds.includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        "receiver.id": userId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// Send a message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, receiverRole, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (!receiverId || !receiverRole || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID, receiver role, and content are required",
      });
    }

    // Get sender info
    let senderName;
    if (senderRole === "sponsor") {
      const sponsor = await Sponsor.findById(senderId);
      senderName = sponsor?.companyName || "Unknown Sponsor";
    } else {
      const sponsee = await Sponsee.findById(senderId);
      senderName =
        sponsee?.organizerName || sponsee?.eventName || "Unknown Sponsee";
    }

    // Get receiver info
    let receiverName;
    if (receiverRole === "sponsor") {
      const sponsor = await Sponsor.findById(receiverId);
      if (!sponsor) {
        return res.status(404).json({
          success: false,
          message: "Receiver not found",
        });
      }
      receiverName = sponsor.companyName;
    } else {
      const sponsee = await Sponsee.findById(receiverId);
      if (!sponsee) {
        return res.status(404).json({
          success: false,
          message: "Receiver not found",
        });
      }
      receiverName = sponsee.organizerName || sponsee.eventName;
    }

    // Create conversation ID
    const conversationId = Message.createConversationId(senderId, receiverId);

    // Create message
    const message = new Message({
      conversationId,
      sender: {
        id: senderId,
        role: senderRole === "sponsor" ? "Sponsor" : "Sponsee",
        name: senderName,
      },
      receiver: {
        id: receiverId,
        role: receiverRole === "sponsor" ? "Sponsor" : "Sponsee",
        name: receiverName,
      },
      content: content.trim(),
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Get unread message count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      "receiver.id": userId,
      read: false,
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
});

// Mark conversation as read
router.put("/conversation/:conversationId/read", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      {
        conversationId,
        "receiver.id": userId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
});

module.exports = router;
