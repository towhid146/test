const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const sponseeSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Please provide an event name"],
      trim: true,
      minlength: [2, "Event name must be at least 2 characters"],
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
    contactPerson: {
      type: String,
      required: [true, "Please provide a contact person name"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    organization: {
      type: String,
      required: [true, "Please provide an organization"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    expectedAttendees: {
      type: Number,
      required: [true, "Please provide expected number of attendees"],
    },
    eventType: {
      type: [String],
      required: [true, "Please select at least one event type"],
    },
    categories: {
      type: [String],
      required: [true, "Please select at least one category"],
    },
    budget: {
      type: Number,
      required: [true, "Please provide a budget"],
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
sponseeSchema.pre("save", async function (next) {
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
sponseeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Sponsee", sponseeSchema);
