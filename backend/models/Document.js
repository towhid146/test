const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      role: {
        type: String,
        enum: ["sponsor", "sponsee"],
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileData: {
      type: String, // Base64 encoded file data
      required: true,
    },
    category: {
      type: String,
      enum: [
        "proposal",
        "contract",
        "invoice",
        "report",
        "presentation",
        "other",
      ],
      default: "other",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        id: mongoose.Schema.Types.ObjectId,
        role: {
          type: String,
          enum: ["sponsor", "sponsee"],
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
documentSchema.index({ "owner.id": 1, createdAt: -1 });
documentSchema.index({ "sharedWith.id": 1 });

module.exports = mongoose.model("Document", documentSchema);
