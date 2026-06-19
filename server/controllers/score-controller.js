// controllers/score-controller.js
const { deriveFeatures, calculateScore } = require("../lib/scoringEngine");
const aiAdapter = require("../lib/aiAdapter");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

exports.realtimeScore = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { cart, paymentOption } = req.body;
    if (!cart || typeof cart.amount !== "number")
      return res.status(400).json({ message: "Invalid cart" });

    const customer = await Customer.findById(customerId).lean();
    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const features = deriveFeatures(customer, orders);
    const ruleResult = calculateScore(customer, orders);

    const payload = {
      features,
      ruleScore: ruleResult.score,
      recentEvents: [{ type: "realtime_check", cart }],
      eventType: "realtime_check",
    };

    let aiResp = null;
    try {
      aiResp = await aiAdapter.callModel(payload);
    } catch (e) {
      console.warn("AI realtime call failed:", e.message || e);
    }

    const aiScore = aiResp?.score ?? ruleResult.score;
    const finalScore = Math.round(aiScore);
    const approvedInstallment = finalScore >= 40;
    const approvedPayLater = finalScore >= 70;

    let plan = null;
    if (paymentOption === "installment" && approvedInstallment) {
      const interest = finalScore >= 80 ? 0.03 : finalScore >= 60 ? 0.07 : 0.12;
      const total = +(cart.amount * (1 + interest)).toFixed(2);
      const per = +(total / 4).toFixed(2);
      plan = { type: "installment", interest, total, per, count: 4 };
    } else if (paymentOption === "pay_later" && approvedPayLater) {
      plan = {
        type: "pay_later",
        interest: 0,
        total: cart.amount,
        dueDays: 30,
      };
    }

    return res.json({
      approved:
        paymentOption === "pay_now"
          ? true
          : paymentOption === "installment"
          ? approvedInstallment
          : approvedPayLater,
      score: finalScore,
      level: finalScore >= 80 ? "High" : finalScore >= 50 ? "Medium" : "Low",
      reasons: (aiResp?.reasons?.map((r) => r.text) || [])
        .concat(ruleResult.reasons.map((r) => r.text))
        .slice(0, 6),
      plan,
    });
  } catch (err) {
    console.error("realtimeScore error:", err);
    res.status(500).json({ message: "realtime scoring failed" });
  }
};
