const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const sponsorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    contactPerson: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      required: [true, "Please select an industry"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    budget: {
      type: Number,
      required: [true, "Please provide a budget"],
    },
    focusAreas: {
      type: [String],
      required: [true, "Please select at least one focus area"],
    },
    website: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Social Auth Fields
    socialAuth: {
      google: {
        id: { type: String, default: null },
        email: { type: String, default: null },
        name: { type: String, default: null },
        picture: { type: String, default: null },
      },
      facebook: {
        id: { type: String, default: null },
        email: { type: String, default: null },
        name: { type: String, default: null },
        picture: { type: String, default: null },
      },
    },
    // Social Links
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
sponsorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
sponsorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate profile completion percentage
sponsorSchema.methods.getProfileCompletion = function () {
  const fields = [
    { name: "companyName", weight: 10 },
    { name: "email", weight: 10 },
    { name: "phone", weight: 10 },
    { name: "contactPerson", weight: 5 },
    { name: "industry", weight: 10 },
    { name: "location", weight: 10 },
    { name: "description", weight: 10 },
    { name: "budget", weight: 10 },
    { name: "focusAreas", weight: 5, isArray: true },
    { name: "website", weight: 5 },
    { name: "logo", weight: 5 },
    { name: "coverPhoto", weight: 5 },
    { name: "socialLinks.linkedin", weight: 2 },
    { name: "socialLinks.twitter", weight: 1 },
    { name: "socialLinks.facebook", weight: 1 },
    { name: "socialLinks.instagram", weight: 1 },
  ];

  let totalWeight = 0;
  let completedWeight = 0;
  const missingFields = [];

  fields.forEach((field) => {
    totalWeight += field.weight;
    let value;

    if (field.name.includes(".")) {
      const parts = field.name.split(".");
      value = this[parts[0]] ? this[parts[0]][parts[1]] : null;
    } else {
      value = this[field.name];
    }

    const isCompleted = field.isArray
      ? Array.isArray(value) && value.length > 0
      : value && value !== "" && value !== 0;

    if (isCompleted) {
      completedWeight += field.weight;
    } else {
      missingFields.push(field.name);
    }
  });

  return {
    percentage: Math.round((completedWeight / totalWeight) * 100),
    missingFields,
    completedFields: fields.length - missingFields.length,
    totalFields: fields.length,
  };
};

module.exports = mongoose.model("Sponsor", sponsorSchema);
