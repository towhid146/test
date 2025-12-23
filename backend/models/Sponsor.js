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

module.exports = mongoose.model("Sponsor", sponsorSchema);
