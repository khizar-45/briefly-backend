const express = require("express");
const router = express.Router();
const {
  loginUser,
  saveApiKey,
  getApiKeyName,
  deleteApiKey,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public Route
router.post("/login", loginUser);

// Protected Routes
router.post("/save-api-key", authMiddleware, saveApiKey);
router.get("/get-api-key-name", authMiddleware, getApiKeyName);
router.delete("/delete-api-key", authMiddleware, deleteApiKey);

module.exports = router;
