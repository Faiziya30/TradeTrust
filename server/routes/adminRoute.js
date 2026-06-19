const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth-middleware");
const adminController = require("../controllers/admin-controller");

// POST /api/admin/merchant/:merchantId/threshold
router.post("/merchant/:merchantId/threshold", async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { threshold } = req.body;
    if (typeof threshold !== "number")
      return res.status(400).json({ message: "threshold number expected" });
    const m = await User.findById(merchantId);
    if (!m) return res.status(404).json({ message: "merchant not found" });
    m.payLaterThreshold = threshold;
    await m.save();
    res.json({ success: true, merchant: m });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "failed" });
  }
});

// Admin: list users
router.get("/users", auth("admin"), adminController.listUsers);

// Admin: get user detail
router.get("/users/:userId", auth("admin"), adminController.getUserDetail);

module.exports = router;
