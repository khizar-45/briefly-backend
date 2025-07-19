const express = require("express");
const router = express.Router();
const {
  generateSummary,
  summarizeTranscript,
} = require("../controllers/gptController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate-summary", authMiddleware, summarizeTranscript);

module.exports = router;
