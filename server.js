const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const gptRoutes = require("./routes/modelRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");
const { fetchTranscript } = require("./controllers/transcriptController");
const modelRoutes = require("./routes/modelRoutes");
const { cleanMarkdown } = require("./controllers/modelController");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/summarize", modelRoutes);
app.use("/transcript", transcriptRoutes);

// mongoose
//   .connect(process.env.MONGODB_URL)
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(process.env.PORT || 5001, () => {
//       console.log(`Server running on port ${process.env.PORT || 5001}`);
//     });
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err.message);
//   });

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT || 5001}`);
});