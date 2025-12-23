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
    res.status(200).json({
      success: true,
      data: sponsor,
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
    res.status(200).json({
      success: true,
      data: sponsee,
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

    await sponsee.save();

    res.status(200).json({
      success: true,
      message: "Sponsee profile updated successfully",
      data: sponsee,
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

    await sponsor.save();

    res.status(200).json({
      success: true,
      message: "Sponsor profile updated successfully",
      data: sponsor,
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
};
