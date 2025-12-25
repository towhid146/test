const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const Sponsor = require("../models/Sponsor");
const Sponsee = require("../models/Sponsee");
const { authMiddleware } = require("../middleware/auth");

// Upload a new document
router.post("/upload", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      fileName,
      fileType,
      fileSize,
      fileData,
      category,
      isPublic,
    } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validation
    if (!title || !fileName || !fileType || !fileData) {
      return res.status(400).json({
        success: false,
        message: "Title, file name, file type, and file data are required",
      });
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (fileSize > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size cannot exceed 5MB",
      });
    }

    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message:
          "File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, TXT",
      });
    }

    // Get owner name
    let ownerName;
    if (userRole === "sponsor") {
      const sponsor = await Sponsor.findById(userId);
      ownerName = sponsor?.companyName || "Unknown Sponsor";
    } else {
      const sponsee = await Sponsee.findById(userId);
      ownerName =
        sponsee?.organizerName || sponsee?.eventName || "Unknown Sponsee";
    }

    // Create document
    const document = new Document({
      owner: {
        id: userId,
        role: userRole,
        name: ownerName,
      },
      title,
      description,
      fileName,
      fileType,
      fileSize,
      fileData,
      category: category || "other",
      isPublic: isPublic || false,
    });

    await document.save();

    // Return document without fileData to reduce response size
    const responseDoc = document.toObject();
    delete responseDoc.fileData;

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: responseDoc,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
});

// Get all documents for current user
router.get("/my-documents", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    let query = { "owner.id": userId };
    if (category && category !== "all") {
      query.category = category;
    }

    const documents = await Document.find(query)
      .select("-fileData") // Exclude file data for listing
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
});

// Get documents shared with current user
router.get("/shared-with-me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({
      "sharedWith.id": userId,
    })
      .select("-fileData")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get shared documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shared documents",
      error: error.message,
    });
  }
});

// Get single document (with file data for download)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check access permission
    const isOwner = document.owner.id.toString() === userId.toString();
    const isSharedWith = document.sharedWith.some(
      (share) => share.id.toString() === userId.toString()
    );
    const isPublic = document.isPublic;

    if (!isOwner && !isSharedWith && !isPublic) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this document",
      });
    }

    // Increment download count if not owner
    if (!isOwner) {
      document.downloads += 1;
      await document.save();
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    });
  }
});

// Share document with another user
router.post("/:id/share", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUserId, targetUserRole } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Only owner can share
    if (document.owner.id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the document owner can share it",
      });
    }

    // Check if already shared
    const alreadyShared = document.sharedWith.some(
      (share) => share.id.toString() === targetUserId
    );

    if (alreadyShared) {
      return res.status(400).json({
        success: false,
        message: "Document already shared with this user",
      });
    }

    // Add to sharedWith
    document.sharedWith.push({
      id: targetUserId,
      role: targetUserRole,
      sharedAt: new Date(),
    });

    await document.save();

    res.json({
      success: true,
      message: "Document shared successfully",
    });
  } catch (error) {
    console.error("Share document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share document",
      error: error.message,
    });
  }
});

// Update document
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, isPublic } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Only owner can update
    if (document.owner.id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the document owner can update it",
      });
    }

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    if (isPublic !== undefined) document.isPublic = isPublic;

    await document.save();

    const responseDoc = document.toObject();
    delete responseDoc.fileData;

    res.json({
      success: true,
      message: "Document updated successfully",
      data: responseDoc,
    });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: error.message,
    });
  }
});

// Delete document
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Only owner can delete
    if (document.owner.id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the document owner can delete it",
      });
    }

    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
});

module.exports = router;
