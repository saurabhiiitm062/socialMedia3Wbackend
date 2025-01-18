const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const { addClient, removeClient } = require("./controllers/eventsHandler");

const app = express();
require("dotenv").config();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

app.use("/api", userRoutes);

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  addClient(res);

  req.on("close", () => removeClient(res));
});

app.listen(process.env.PORT, () =>
  console.log(`server is running on port ${process.env.PORT}`)
);
