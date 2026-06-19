// routes/scoreRoute.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");

const { realtimeScore } = require("../controllers/score-controller");
const ScoringEvent = require("../models/ScoringEvent");

// sanity test route
router.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// realtime credit check
const { validate } = require('../middleware/validate');
const { realtimeSchema } = require('../validators/scoreValidators');
router.post("/realtime", auth(), validate(realtimeSchema), realtimeScore);

// analytics events
router.get("/events", auth(), async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "customerId missing" });
    }

    const events = await ScoringEvent.find({ customerId })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    const logger = require('../middleware/logger');
    logger.error({ err }, 'score/events error');
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
