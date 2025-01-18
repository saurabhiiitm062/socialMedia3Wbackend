const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const { addClient, removeClient } = require("./controllers/eventsHandler");
require("dotenv").config(); // Load environment variables

const app = express();
connectDB();

// Define allowed origins for CORS
const allowedOrigins = [
  "https://3wsocialmedia.netlify.app",
  "https://*.netlify.app", // Wildcard for any subdomain under netlify.app
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS Origin: " + origin);
      // Allow requests from allowed origins or no origin (for same-origin requests)
      if (
        !origin ||
        allowedOrigins.some((allowedOrigin) =>
          origin.match(new RegExp(`^${allowedOrigin.replace("*", ".*")}$`))
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly handle OPTIONS
    credentials: true, // Allow credentials
    allowedHeaders: ["Content-Type", "Authorization"], // Ensure headers are allowed
  })
);

// Handle preflight requests explicitly for OPTIONS method
app.options("*", cors()); // Allow preflight OPTIONS requests for all routes

app.use(express.json());
app.use(express.static("public/uploads"));

// Example API route
app.get("/api", (req, res) => {
  res.send("API is working!");
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
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
