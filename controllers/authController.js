const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const Summary = require("../models/Summary");

// --- Setup Encryption Key ---
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012"; // 32 chars
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 characters long");
}

// --- Encryption Helpers ---
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (text) => {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// --- Save API Key ---
const saveApiKey = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, value } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name || !value) return res.status(400).json({ message: "API key name and value required." });

    const encryptedValue = encrypt(value);

    await User.findByIdAndUpdate(
      userId,
      { apiKey: { name, value: encryptedValue } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "API key saved successfully." });
  } catch (err) {
    console.error("Save API key error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// --- Get API Key Name ---
const getApiKeyName = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user?.apiKey?.name) {
      return res.status(404).json({ success: false, message: "No API key found." });
    }
    res.status(200).json({ success: true, name: user.apiKey.name });
  } catch (err) {
    console.error("Get API key error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// --- Delete API Key ---
const deleteApiKey = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user?.id, { $unset: { apiKey: 1 } });
    res.status(200).json({ success: true, message: "API key deleted successfully." });
  } catch (err) {
    console.error("Delete API key error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// --- Login User ---
const loginUser = async (req, res) => {
  try {
    const { name, email, profilePic } = req.body;
    if (!name || !email || !profilePic) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, profilePic });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "fallbacksecret",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  loginUser,
  saveApiKey,
  getApiKeyName,
  deleteApiKey,
};
