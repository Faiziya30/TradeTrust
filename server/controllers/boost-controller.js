// controllers/boost-controller.js
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { updateScore } = require("../lib/scoringEngine");

/**
 * External -> internal booster key map (UI-friendly keys -> Customer schema keys)
 */
const EXTERNAL_TO_INTERNAL = {
  phoneVerified: "phoneVerified",
  cardLinked: "cardLinked",
  verifiedReview: "verifiedReviews",
  verifiedReviews: "verifiedReviews",
  onTimePayment: "onTimePayments",
  onTimePayments: "onTimePayments",
};

const boostScore = async (req, res) => {
  try {
    const customerId = req.user?.customerId;
    if (!customerId)
      return res
        .status(401)
        .json({ message: "Customer not attached to token" });

    const externalKey = req.params.booster;
    const internalKey = EXTERNAL_TO_INTERNAL[externalKey];
    if (!internalKey)
      return res.status(400).json({ message: "Unknown booster" });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    if (!customer.boosters) customer.boosters = {};

    // boolean flags vs counters
    if (internalKey === "phoneVerified" || internalKey === "cardLinked") {
      customer.boosters[internalKey] = true;
    } else if (internalKey === "verifiedReviews") {
      customer.boosters.verifiedReviews =
        (customer.boosters.verifiedReviews || 0) + 1;
    } else if (internalKey === "onTimePayments") {
      customer.boosters.onTimePayments =
        (customer.boosters.onTimePayments || 0) + 1;
    }

    await customer.save();

    // fetch orders and compute new score (sorted)
    await ScoringEvent.create({
      customerId,
      eventType: "booster",
      payload: {
        booster: internalKey,
      },
    });

    return res.json({ success: true, booster: internalKey });

  } catch (err) {
    console.error("Boost error:", err);
    res.status(500).json({ message: "Booster failed" });
  }
};

module.exports = boostScore;
