const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Sponsor = require("../models/Sponsor");
const Sponsee = require("../models/Sponsee");
const Message = require("../models/Message");
const Document = require("../models/Document");

// Admin Auth Middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or inactive",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid admin token",
    });
  }
};

// Permission check middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.admin.role === "super_admin" || req.admin.permissions[permission]) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Permission denied: ${permission}`,
      });
    }
  };
};

// ==================== AUTH ROUTES ====================

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account is locked. Try again later.",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await Admin.findByIdAndUpdate(admin._id, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 },
    });

    const token = jwt.sign(
      { id: admin._id, role: "admin", adminRole: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get Current Admin
router.get("/me", adminAuth, async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      fullName: req.admin.fullName,
      role: req.admin.role,
      permissions: req.admin.permissions,
      avatar: req.admin.avatar,
      lastLogin: req.admin.lastLogin,
    },
  });
});

// ==================== DASHBOARD STATS ====================

router.get(
  "/stats",
  adminAuth,
  checkPermission("viewAnalytics"),
  async (req, res) => {
    try {
      const [
        totalSponsors,
        totalSponsees,
        totalMessages,
        totalDocuments,
        verifiedSponsors,
        verifiedSponsees,
        recentSponsors,
        recentSponsees,
      ] = await Promise.all([
        Sponsor.countDocuments(),
        Sponsee.countDocuments(),
        Message.countDocuments(),
        Document.countDocuments(),
        Sponsor.countDocuments({ isVerified: true }),
        Sponsee.countDocuments({ isVerified: true }),
        Sponsor.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("companyName email createdAt isVerified"),
        Sponsee.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("eventName email createdAt isVerified"),
      ]);

      // Get registrations by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const sponsorsByMonth = await Sponsor.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const sponseesByMonth = await Sponsee.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        success: true,
        stats: {
          totalSponsors,
          totalSponsees,
          totalUsers: totalSponsors + totalSponsees,
          totalMessages,
          totalDocuments,
          verifiedSponsors,
          verifiedSponsees,
          verificationRate: {
            sponsors:
              totalSponsors > 0
                ? ((verifiedSponsors / totalSponsors) * 100).toFixed(1)
                : 0,
            sponsees:
              totalSponsees > 0
                ? ((verifiedSponsees / totalSponsees) * 100).toFixed(1)
                : 0,
          },
        },
        recentUsers: {
          sponsors: recentSponsors,
          sponsees: recentSponsees,
        },
        charts: {
          sponsorsByMonth,
          sponseesByMonth,
        },
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching stats",
      });
    }
  }
);

// ==================== USER MANAGEMENT ====================

// Get all sponsors (with pagination)
router.get(
  "/sponsors",
  adminAuth,
  checkPermission("manageUsers"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const verified = req.query.verified;

      const query = {};
      if (search) {
        query.$or = [
          { companyName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (verified !== undefined) {
        query.isVerified = verified === "true";
      }

      const total = await Sponsor.countDocuments(query);
      const sponsors = await Sponsor.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password");

      res.json({
        success: true,
        sponsors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sponsors",
      });
    }
  }
);

// Get all sponsees (with pagination)
router.get(
  "/sponsees",
  adminAuth,
  checkPermission("manageUsers"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const verified = req.query.verified;

      const query = {};
      if (search) {
        query.$or = [
          { eventName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { organization: { $regex: search, $options: "i" } },
        ];
      }
      if (verified !== undefined) {
        query.isVerified = verified === "true";
      }

      const total = await Sponsee.countDocuments(query);
      const sponsees = await Sponsee.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password");

      res.json({
        success: true,
        sponsees,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sponsees",
      });
    }
  }
);

// Verify/Unverify Sponsor
router.patch(
  "/sponsors/:id/verify",
  adminAuth,
  checkPermission("manageUsers"),
  async (req, res) => {
    try {
      const { isVerified } = req.body;
      const sponsor = await Sponsor.findByIdAndUpdate(
        req.params.id,
        { isVerified },
        { new: true }
      ).select("-password");

      if (!sponsor) {
        return res.status(404).json({
          success: false,
          message: "Sponsor not found",
        });
      }

      res.json({
        success: true,
        message: `Sponsor ${
          isVerified ? "verified" : "unverified"
        } successfully`,
        sponsor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating sponsor",
      });
    }
  }
);

// Verify/Unverify Sponsee
router.patch(
  "/sponsees/:id/verify",
  adminAuth,
  checkPermission("manageUsers"),
  async (req, res) => {
    try {
      const { isVerified } = req.body;
      const sponsee = await Sponsee.findByIdAndUpdate(
        req.params.id,
        { isVerified },
        { new: true }
      ).select("-password");

      if (!sponsee) {
        return res.status(404).json({
          success: false,
          message: "Sponsee not found",
        });
      }

      res.json({
        success: true,
        message: `Sponsee ${
          isVerified ? "verified" : "unverified"
        } successfully`,
        sponsee,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating sponsee",
      });
    }
  }
);

// Delete Sponsor
router.delete(
  "/sponsors/:id",
  adminAuth,
  checkPermission("manageUsers"),
  async (req, res) => {
    try {
      const sponsor = await Sponsor.findByIdAndDelete(req.params.id);

      if (!sponsor) {
        return res.status(404).json({
          success: false,
          message: "Sponsor not found",
        });
      }

      // Also delete related messages and documents
      await Message.deleteMany({
        $or: [{ "sender.id": req.params.id }, { "receiver.id": req.params.id }],
      });
      await Document.deleteMany({ "owner.id": req.params.id });

      res.json({
        success: true,
        message: "Sponsor and related data deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting sponsor",
      });
    }
  }
);

// Delete Sponsee
router.delete(
  "/sponsees/:id",
  adminAuth,
  checkPermission("manageUsers"),
  async (req, res) => {
    try {
      const sponsee = await Sponsee.findByIdAndDelete(req.params.id);

      if (!sponsee) {
        return res.status(404).json({
          success: false,
          message: "Sponsee not found",
        });
      }

      // Also delete related messages and documents
      await Message.deleteMany({
        $or: [{ "sender.id": req.params.id }, { "receiver.id": req.params.id }],
      });
      await Document.deleteMany({ "owner.id": req.params.id });

      res.json({
        success: true,
        message: "Sponsee and related data deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting sponsee",
      });
    }
  }
);

// ==================== ADMIN MANAGEMENT ====================

// Get all admins (super_admin only)
router.get(
  "/admins",
  adminAuth,
  checkPermission("manageAdmins"),
  async (req, res) => {
    try {
      const admins = await Admin.find()
        .select("-password")
        .populate("createdBy", "username fullName");

      res.json({
        success: true,
        admins,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching admins",
      });
    }
  }
);

// Create new admin (super_admin only)
router.post(
  "/admins",
  adminAuth,
  checkPermission("manageAdmins"),
  async (req, res) => {
    try {
      const { username, email, password, fullName, role, permissions } =
        req.body;

      // Only super_admin can create other super_admins
      if (role === "super_admin" && req.admin.role !== "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Only super admin can create super admin accounts",
        });
      }

      const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }],
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Admin with this email or username already exists",
        });
      }

      const admin = await Admin.create({
        username,
        email,
        password,
        fullName,
        role: role || "admin",
        permissions: permissions || {},
        createdBy: req.admin._id,
      });

      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions,
        },
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error creating admin",
      });
    }
  }
);

// Update admin
router.put(
  "/admins/:id",
  adminAuth,
  checkPermission("manageAdmins"),
  async (req, res) => {
    try {
      const { fullName, role, permissions, isActive } = req.body;

      // Prevent modifying super_admin unless you are one
      const targetAdmin = await Admin.findById(req.params.id);
      if (
        targetAdmin.role === "super_admin" &&
        req.admin.role !== "super_admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Cannot modify super admin account",
        });
      }

      const admin = await Admin.findByIdAndUpdate(
        req.params.id,
        { fullName, role, permissions, isActive },
        { new: true }
      ).select("-password");

      res.json({
        success: true,
        message: "Admin updated successfully",
        admin,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating admin",
      });
    }
  }
);

// Delete admin
router.delete(
  "/admins/:id",
  adminAuth,
  checkPermission("manageAdmins"),
  async (req, res) => {
    try {
      // Prevent self-deletion
      if (req.params.id === req.admin._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      const targetAdmin = await Admin.findById(req.params.id);
      if (targetAdmin.role === "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Cannot delete super admin account",
        });
      }

      await Admin.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Admin deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting admin",
      });
    }
  }
);

module.exports = router;
