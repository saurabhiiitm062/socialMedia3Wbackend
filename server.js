const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const { addClient, removeClient } = require("./controllers/eventsHandler");
require("dotenv").config(); 

const app = express();
connectDB();

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true, 
  })
);

app.use(express.json());

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
