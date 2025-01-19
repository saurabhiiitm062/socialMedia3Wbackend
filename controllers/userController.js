const bcrypt = require("bcrypt"); // For password hashing
const jwt = require("jsonwebtoken"); // JWT for token generation
const User = require("../models/User");
const Admin = require("../models/Admin");
const { notifyClients } = require("./eventsHandler");

// Create a new user with image uploads (excluding password and role logic for regular users)
const createUser = async (req, res) => {
  const { name, socialHandle } = req.body;
  const imagePaths = req.files.map((file) => file.path.replace(/\\/g, "/"));
  console.log(imagePaths,"img path")

  try {
    const user = new User({ name, socialHandle, images: imagePaths });
    await user.save();
    console.log("User created:", user);
    await notifyClients();
    res.status(201).json({ message: "User submitted successfully!", user });
  } catch (error) {
    console.log("Error creating user:", error.message);
    res.status(500).json({ message: "Error submitting user", error });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const adminRegistration = async (req, res) => {
  const { role, email, password } = req.body;

  try {
    // Check if the email is already taken
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role: role || "admin",
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (error) {
    console.log("Error creating admin:", error);
    res.status(500).json({ message: "Error creating admin", error });
  }
};

// Admin login with JWT token generation (password hashing comparison)
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token with the user’s role
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "Login successful", token, role: admin.role });
  } catch (error) {
    console.log("Error during login:", error.message);
    res.status(500).json({ message: "Error during login", error });
  }
};

module.exports = { createUser, getUsers, adminLogin, adminRegistration };
