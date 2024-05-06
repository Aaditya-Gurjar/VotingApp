const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  mobile: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
  },
  aadharCardNumber: {
    type: Number,
    minLength: 12,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  // Check if the password field is modified or is new
  if (!this.isModified("password")) {
    return next(); // If not modified, move to the next middleware
  }

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // Replace the plain text password with the hashed one
    this.password = hashedPassword;
    next(); // Move to the next middleware
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
