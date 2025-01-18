const express = require("express");
const multer = require("multer");
const {
  createUser,
  getUsers,
  adminLogin,
  adminRegistration,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/Auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

//  routes
router.post("/submit", upload.array("images"), createUser);
router.get("/users", authMiddleware(["admin"]), getUsers);
router.post("/admin-login", adminLogin);
router.post("/admin-register", adminRegistration);

module.exports = router;
