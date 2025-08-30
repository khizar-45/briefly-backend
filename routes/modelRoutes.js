const express = require("express");
const router = express.Router();
const { summarizeTranscript } = require("../controllers/modelController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate-summary", summarizeTranscript);

module.exports = router;
