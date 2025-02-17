const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const { addClient, removeClient } = require("./controllers/eventsHandler");
require("dotenv").config();

const app = express();
connectDB();

// Define allowed origins for CORS
const allowedOrigins = ["http://localhost:3000"]; // Frontend URL

// CORS middleware configuration
app.use(
  cors({
    origin: "https://3wsocialmedia.netlify.app", // Correct URL without the trailing slash
    methods: ["GET", "POST", "PUT", "DELETE"], // Use an array for methods
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("public/uploads"));

// Example API route
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});
app.use("/api", userRoutes); // Use user-related routes

// Event handling with Server-Sent Events (SSE)
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  addClient(res);
  req.on("close", () => removeClient(res)); // Clean up after the connection is closed
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
