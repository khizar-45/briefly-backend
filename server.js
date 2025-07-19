const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const gptRoutes = require("./routes/gptRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/gpt", gptRoutes);
app.use("/api/transcript", transcriptRoutes);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
