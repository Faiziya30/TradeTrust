const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth-middleware");
const adminController = require("../controllers/admin-controller");

// POST /api/admin/merchant/:merchantId/threshold
const { validate } = require('../middleware/validate');
const { thresholdSchema } = require('../validators/adminValidators');
router.post("/merchant/:merchantId/threshold", validate(thresholdSchema), async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { threshold } = req.body;
    const m = await User.findById(merchantId);
    if (!m) return res.status(404).json({ message: "merchant not found" });
    m.payLaterThreshold = threshold;
    await m.save();
    res.json({ success: true, merchant: m });
  } catch (err) {
    const logger = require('../middleware/logger');
    logger.error({ err }, 'adminRoute /merchant/:merchantId/threshold error');
    res.status(500).json({ message: "failed" });
  }
});

// Admin: list users
router.get("/users", auth("admin"), adminController.listUsers);

// Admin: get user detail
router.get("/users/:userId", auth("admin"), adminController.getUserDetail);

module.exports = router;
