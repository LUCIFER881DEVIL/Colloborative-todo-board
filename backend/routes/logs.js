const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const ActionLog = require("../models/ActionLog");

const router = express.Router();

// Get the last 20 logs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "username email");

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router; // ✅ important
