const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.encryptedApiKey) {
      return res.status(403).json({ message: "No API key found for this user." });
    }

    // Decrypt the encrypted API key
    const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 32 bytes
    const IV = Buffer.from(process.env.ENCRYPTION_IV, "hex"); // 16 bytes

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(user.encryptedApiKey, "hex", "utf8");
    decrypted += decipher.final("utf8");

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      apiKey: decrypted,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
