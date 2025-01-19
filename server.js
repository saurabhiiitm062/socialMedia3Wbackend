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
  /\.netlify\.app$/, // Regex for any subdomain under netlify.app
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS Origin:", origin);
      // Allow requests from Postman, same-origin, or no origin (e.g., SSR)
      if (
        !origin ||
        allowedOrigins.some((allowedOrigin) =>
          typeof allowedOrigin === "string"
            ? origin === allowedOrigin
            : allowedOrigin.test(origin)
        )
      ) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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
  req.on("close", () => removeClient(res));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
