const Sponsor = require("../models/Sponsor");
const Sponsee = require("../models/Sponsee");
const { generateToken } = require("../middleware/auth");

// Sponsor Registration
const sponsorRegister = async (req, res) => {
  try {
    const {
      companyName,
      email,
      password,
      phone,
      industry,
      location,
      description,
      budget,
      focusAreas,
      website,
      logo,
      coverPhoto,
    } = req.body;

    // Validation
    if (
      !companyName ||
      !email ||
      !password ||
      !phone ||
      !industry ||
      !location ||
      !budget ||
      !focusAreas
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if sponsor already exists
    const existingSponsor = await Sponsor.findOne({ email });
    if (existingSponsor) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new sponsor
    const sponsor = new Sponsor({
      companyName,
      email,
      password,
      phone,
      industry,
      location,
      description,
      budget,
      focusAreas: Array.isArray(focusAreas) ? focusAreas : [focusAreas],
      website,
    });

    await sponsor.save();

    // Generate token
    const token = generateToken(sponsor._id, "sponsor");

    // Return success response
    res.status(201).json({
      success: true,
      message: "Sponsor registered successfully",
      token,
      user: {
        id: sponsor._id,
        companyName: sponsor.companyName,
        email: sponsor.email,
        userType: "sponsor",
      },
    });
  } catch (error) {
    console.error("Sponsor registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// Sponsor Login
const sponsorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find sponsor by email
    const sponsor = await Sponsor.findOne({ email }).select("+password");
    if (!sponsor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await sponsor.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(sponsor._id, "sponsor");

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: sponsor._id,
        companyName: sponsor.companyName,
        email: sponsor.email,
        userType: "sponsor",
      },
    });
  } catch (error) {
    console.error("Sponsor login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Sponsee Registration
const sponseeRegister = async (req, res) => {
  try {
    const {
      eventName,
      email,
      password,
      contactPerson,
      phone,
      organization,
      location,
      description,
      expectedAttendees,
      eventType,
      categories,
      budget,
      website,
    } = req.body;

    // Validation
    if (
      !eventName ||
      !email ||
      !password ||
      !contactPerson ||
      !phone ||
      !organization ||
      !location ||
      !expectedAttendees ||
      !eventType ||
      !categories ||
      !budget
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if sponsee already exists
    const existingSponse = await Sponsee.findOne({ email });
    if (existingSponse) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new sponsee
    const sponsee = new Sponsee({
      eventName,
      email,
      password,
      contactPerson,
      phone,
      organization,
      location,
      description,
      expectedAttendees,
      eventType: Array.isArray(eventType) ? eventType : [eventType],
      categories: Array.isArray(categories) ? categories : [categories],
      budget,
      website,
    });

    await sponsee.save();

    // Generate token
    const token = generateToken(sponsee._id, "sponsee");

    // Return success response
    res.status(201).json({
      success: true,
      message: "Sponsee registered successfully",
      token,
      user: {
        id: sponsee._id,
        eventName: sponsee.eventName,
        email: sponsee.email,
        userType: "sponsee",
      },
    });
  } catch (error) {
    console.error("Sponsee registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// Sponsee Login
const sponseeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find sponsee by email
    const sponsee = await Sponsee.findOne({ email }).select("+password");
    if (!sponsee) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await sponsee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(sponsee._id, "sponsee");

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: sponsee._id,
        eventName: sponsee.eventName,
        email: sponsee.email,
        userType: "sponsee",
      },
    });
  } catch (error) {
    console.error("Sponsee login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get Sponsee Profile
const getSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    // Get profile completion
    const profileCompletion = sponsor.getProfileCompletion();

    res.status(200).json({
      success: true,
      data: sponsor,
      profileCompletion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getSponsee = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsee = await Sponsee.findById(id);
    if (!sponsee) {
      return res.status(404).json({
        success: false,
        message: "Sponsee not found",
      });
    }

    // Get profile completion
    const profileCompletion = sponsee.getProfileCompletion();

    res.status(200).json({
      success: true,
      data: sponsee,
      profileCompletion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update Sponsee Profile
const updateSponsee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      eventName,
      contactPerson,
      phone,
      organization,
      location,
      description,
      expectedAttendees,
      eventType,
      categories,
      budget,
      website,
      logo,
      coverPhoto,
      socialLinks,
    } = req.body;

    const sponsee = await Sponsee.findById(id);
    if (!sponsee) {
      return res.status(404).json({
        success: false,
        message: "Sponsee not found",
      });
    }

    // Update fields if provided
    if (eventName) sponsee.eventName = eventName;
    if (contactPerson) sponsee.contactPerson = contactPerson;
    if (phone) sponsee.phone = phone;
    if (organization) sponsee.organization = organization;
    if (location) sponsee.location = location;
    if (description) sponsee.description = description;
    if (expectedAttendees) sponsee.expectedAttendees = expectedAttendees;
    if (eventType)
      sponsee.eventType = Array.isArray(eventType) ? eventType : [eventType];
    if (categories)
      sponsee.categories = Array.isArray(categories)
        ? categories
        : [categories];
    if (budget) sponsee.budget = budget;
    if (website) sponsee.website = website;
    if (logo) sponsee.logo = logo;
    if (coverPhoto) sponsee.coverPhoto = coverPhoto;
    if (socialLinks) {
      sponsee.socialLinks = {
        ...sponsee.socialLinks,
        ...socialLinks,
      };
    }

    await sponsee.save();

    // Get updated profile completion
    const profileCompletion = sponsee.getProfileCompletion();

    res.status(200).json({
      success: true,
      message: "Sponsee profile updated successfully",
      data: sponsee,
      profileCompletion,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during update",
    });
  }
};

// Update Sponsor Profile
const updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName,
      contactPerson,
      phone,
      industry,
      location,
      description,
      budget,
      focusAreas,
      website,
      logo,
      coverPhoto,
      socialLinks,
    } = req.body;

    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    // Update fields if provided
    if (companyName) sponsor.companyName = companyName;
    if (contactPerson) sponsor.contactPerson = contactPerson;
    if (phone) sponsor.phone = phone;
    if (industry) sponsor.industry = industry;
    if (location) sponsor.location = location;
    if (description) sponsor.description = description;
    if (budget) sponsor.budget = budget;
    if (focusAreas)
      sponsor.focusAreas = Array.isArray(focusAreas)
        ? focusAreas
        : [focusAreas];
    if (website) sponsor.website = website;
    if (logo) sponsor.logo = logo;
    if (coverPhoto) sponsor.coverPhoto = coverPhoto;
    if (socialLinks) {
      sponsor.socialLinks = {
        ...sponsor.socialLinks,
        ...socialLinks,
      };
    }

    await sponsor.save();

    // Get updated profile completion
    const profileCompletion = sponsor.getProfileCompletion();

    res.status(200).json({
      success: true,
      message: "Sponsor profile updated successfully",
      data: sponsor,
      profileCompletion,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during update",
    });
  }
};

// Get all Sponsees
const getAllSponsees = async (req, res) => {
  try {
    const sponsees = await Sponsee.find();
    res.status(200).json({
      success: true,
      data: sponsees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all Sponsors
const getAllSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find();
    res.status(200).json({
      success: true,
      data: sponsors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Store for reset codes (in production, use Redis or database)
const resetCodes = new Map();

// Forgot Password - Send Reset Code
const forgotPassword = async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email and user type are required",
      });
    }

    // Find user based on type
    let user;
    if (userType === "sponsor") {
      user = await Sponsor.findOne({ email });
    } else if (userType === "sponsee") {
      user = await Sponsee.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with expiry (10 minutes)
    resetCodes.set(email, {
      code,
      userType,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // In production, send email here
    // For now, we'll log it (you would integrate with email service like SendGrid, Nodemailer, etc.)
    console.log(`Password reset code for ${email}: ${code}`);

    res.status(200).json({
      success: true,
      message: "Reset code sent to your email",
      // For development/testing, include the code (remove in production!)
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Verify Reset Code
const verifyResetCode = async (req, res) => {
  try {
    const { email, code, userType } = req.body;

    if (!email || !code || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and user type are required",
      });
    }

    const storedData = resetCodes.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No reset code found. Please request a new one.",
      });
    }

    if (Date.now() > storedData.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Reset code expired. Please request a new one.",
      });
    }

    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    // Generate a temporary token for password reset
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    storedData.resetToken = resetToken;
    resetCodes.set(email, storedData);

    res.status(200).json({
      success: true,
      message: "Code verified successfully",
      token: resetToken,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword, userType } = req.body;

    if (!email || !token || !newPassword || !userType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const storedData = resetCodes.get(email);

    if (!storedData || storedData.resetToken !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Find and update user
    let user;
    if (userType === "sponsor") {
      user = await Sponsor.findOne({ email });
    } else if (userType === "sponsee") {
      user = await Sponsee.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear reset code
    resetCodes.delete(email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Google Social Auth
const googleAuth = async (req, res) => {
  try {
    const { credential, userType } = req.body;

    if (!credential || !userType) {
      return res.status(400).json({
        success: false,
        message: "Google credential and user type are required",
      });
    }

    // Decode Google JWT token (in production, verify with Google API)
    const base64Payload = credential.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString());

    const { sub: googleId, email, name, picture } = payload;

    let user;
    let isNewUser = false;

    if (userType === "sponsor") {
      // Check if user exists with this Google ID or email
      user = await Sponsor.findOne({
        $or: [{ "socialAuth.google.id": googleId }, { email: email }],
      });

      if (!user) {
        // Create new sponsor with Google data
        user = new Sponsor({
          companyName: name,
          email: email,
          password: require("crypto").randomBytes(32).toString("hex"), // Random password for social auth
          phone: "Not provided",
          industry: "Not specified",
          location: "Not specified",
          budget: 0,
          focusAreas: ["General"],
          logo: picture,
          socialAuth: {
            google: {
              id: googleId,
              email: email,
              name: name,
              picture: picture,
            },
          },
        });
        await user.save();
        isNewUser = true;
      } else if (!user.socialAuth?.google?.id) {
        // Link Google account to existing user
        user.socialAuth = user.socialAuth || {};
        user.socialAuth.google = {
          id: googleId,
          email: email,
          name: name,
          picture: picture,
        };
        await user.save();
      }

      const token = generateToken(user._id, "sponsor");
      const profileCompletion = user.getProfileCompletion();

      return res.status(200).json({
        success: true,
        message: isNewUser ? "Account created with Google" : "Login successful",
        token,
        isNewUser,
        user: {
          id: user._id,
          companyName: user.companyName,
          email: user.email,
          userType: "sponsor",
        },
        profileCompletion,
      });
    } else if (userType === "sponsee") {
      // Check if user exists with this Google ID or email
      user = await Sponsee.findOne({
        $or: [{ "socialAuth.google.id": googleId }, { email: email }],
      });

      if (!user) {
        // Create new sponsee with Google data
        user = new Sponsee({
          eventName: name + "'s Event",
          email: email,
          password: require("crypto").randomBytes(32).toString("hex"),
          contactPerson: name,
          phone: "Not provided",
          organization: "Not specified",
          location: "Not specified",
          expectedAttendees: 0,
          eventType: ["General"],
          categories: ["General"],
          budget: 0,
          logo: picture,
          socialAuth: {
            google: {
              id: googleId,
              email: email,
              name: name,
              picture: picture,
            },
          },
        });
        await user.save();
        isNewUser = true;
      } else if (!user.socialAuth?.google?.id) {
        // Link Google account to existing user
        user.socialAuth = user.socialAuth || {};
        user.socialAuth.google = {
          id: googleId,
          email: email,
          name: name,
          picture: picture,
        };
        await user.save();
      }

      const token = generateToken(user._id, "sponsee");
      const profileCompletion = user.getProfileCompletion();

      return res.status(200).json({
        success: true,
        message: isNewUser ? "Account created with Google" : "Login successful",
        token,
        isNewUser,
        user: {
          id: user._id,
          eventName: user.eventName,
          email: user.email,
          userType: "sponsee",
        },
        profileCompletion,
      });
    }
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Social authentication failed",
    });
  }
};

// Facebook Social Auth
const facebookAuth = async (req, res) => {
  try {
    const { accessToken, userID, name, email, picture, userType } = req.body;

    if (!accessToken || !userID || !userType) {
      return res.status(400).json({
        success: false,
        message: "Facebook credentials and user type are required",
      });
    }

    let user;
    let isNewUser = false;

    if (userType === "sponsor") {
      // Check if user exists with this Facebook ID or email
      user = await Sponsor.findOne({
        $or: [
          { "socialAuth.facebook.id": userID },
          ...(email ? [{ email: email }] : []),
        ],
      });

      if (!user) {
        // Create new sponsor with Facebook data
        user = new Sponsor({
          companyName: name,
          email: email || `fb_${userID}@placeholder.com`,
          password: require("crypto").randomBytes(32).toString("hex"),
          phone: "Not provided",
          industry: "Not specified",
          location: "Not specified",
          budget: 0,
          focusAreas: ["General"],
          logo: picture,
          socialAuth: {
            facebook: {
              id: userID,
              email: email,
              name: name,
              picture: picture,
            },
          },
        });
        await user.save();
        isNewUser = true;
      } else if (!user.socialAuth?.facebook?.id) {
        // Link Facebook account to existing user
        user.socialAuth = user.socialAuth || {};
        user.socialAuth.facebook = {
          id: userID,
          email: email,
          name: name,
          picture: picture,
        };
        await user.save();
      }

      const token = generateToken(user._id, "sponsor");
      const profileCompletion = user.getProfileCompletion();

      return res.status(200).json({
        success: true,
        message: isNewUser
          ? "Account created with Facebook"
          : "Login successful",
        token,
        isNewUser,
        user: {
          id: user._id,
          companyName: user.companyName,
          email: user.email,
          userType: "sponsor",
        },
        profileCompletion,
      });
    } else if (userType === "sponsee") {
      // Check if user exists with this Facebook ID or email
      user = await Sponsee.findOne({
        $or: [
          { "socialAuth.facebook.id": userID },
          ...(email ? [{ email: email }] : []),
        ],
      });

      if (!user) {
        // Create new sponsee with Facebook data
        user = new Sponsee({
          eventName: name + "'s Event",
          email: email || `fb_${userID}@placeholder.com`,
          password: require("crypto").randomBytes(32).toString("hex"),
          contactPerson: name,
          phone: "Not provided",
          organization: "Not specified",
          location: "Not specified",
          expectedAttendees: 0,
          eventType: ["General"],
          categories: ["General"],
          budget: 0,
          logo: picture,
          socialAuth: {
            facebook: {
              id: userID,
              email: email,
              name: name,
              picture: picture,
            },
          },
        });
        await user.save();
        isNewUser = true;
      } else if (!user.socialAuth?.facebook?.id) {
        // Link Facebook account to existing user
        user.socialAuth = user.socialAuth || {};
        user.socialAuth.facebook = {
          id: userID,
          email: email,
          name: name,
          picture: picture,
        };
        await user.save();
      }

      const token = generateToken(user._id, "sponsee");
      const profileCompletion = user.getProfileCompletion();

      return res.status(200).json({
        success: true,
        message: isNewUser
          ? "Account created with Facebook"
          : "Login successful",
        token,
        isNewUser,
        user: {
          id: user._id,
          eventName: user.eventName,
          email: user.email,
          userType: "sponsee",
        },
        profileCompletion,
      });
    }
  } catch (error) {
    console.error("Facebook auth error:", error);
    res.status(500).json({
      success: false,
      message: "Social authentication failed",
    });
  }
};

module.exports = {
  sponsorRegister,
  sponsorLogin,
  sponseeRegister,
  sponseeLogin,
  getSponsor,
  getSponsee,
  updateSponsee,
  updateSponsor,
  getAllSponsees,
  getAllSponsors,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  googleAuth,
  facebookAuth,
};
