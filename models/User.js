const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socialHandle: { type: String, required: true },
  images: { type: [String], required: true },
});
module.exports = mongoose.model("User", userSchema);
