const express = require("express");
const router = express.Router();
const {
  fetchTranscript,
  getSummaryHistory,
} = require("../controllers/transcriptController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/fetch", authMiddleware, fetchTranscript);
router.get("/history", authMiddleware, getSummaryHistory);

module.exports = router;
