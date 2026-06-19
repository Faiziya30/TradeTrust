// controllers/customer-controller.js
const Order = require("../models/Order");
const Score = require("../models/Score");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const InstallmentPlan = require("../models/InstallmentPlan");
const ScoringEvent = require("../models/ScoringEvent");
const { requireCustomerAccess } = require("../lib/access");
const {
  collectCustomerInsights,
  buildOrderStats,
} = require("../lib/customerInsights");
const { pushNotification } = require("../lib/notifications");
const { calculateScore } = require("../lib/scoringEngine");
const aiAdapter = require("../lib/aiAdapter");

// getProfile unchanged but ensure we surface structured latestScore.reasons
exports.getProfile = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!requireCustomerAccess(req, res, customerId)) return;

    // Fetch insights without triggering an on-demand score refresh to return
    // the authoritative, persisted score documents as-is.
    const insights = await collectCustomerInsights(customerId, {
      skipRefresh: true,
    });
    if (!insights)
      return res.status(404).json({ message: "Customer not found" });

    // Ensure latestScore.reasons comes as structured objects if available
    const latestScore = insights.latestScore
      ? {
          score: insights.latestScore.score,
          level: insights.latestScore.level,
          createdAt: insights.latestScore.createdAt,
          reasons:
            insights.latestScoreDoc?.reasons ||
            insights.customer?.lastScoreReasons ||
            [],
        }
      : null;

    const rawPlans = await InstallmentPlan.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      customer: {
        id: insights.customer._id,
        name: insights.customer.name,
        email: insights.customer.email,
        phone: insights.customer.phone,
        boosters: insights.customer.boosters,
        lastActive: insights.customer.lastActive,
        kycStatus: insights.customer.kycStatus,
        addressVerified: insights.customer.addressVerified,
        bankLinked: insights.customer.bankLinked,
      },
      latestScore,
      trend: insights.trend,
      scoreHistory: insights.scoreHistory,
      orderStats: insights.orderStats,
      recommendations: insights.recommendations,
      reasons: insights.reasons,
      orders: insights.sanitizedOrders,
      notifications: insights.notifications,
      unreadNotifications: insights.unreadNotifications,
      installmentPlans: rawPlans,
      boosterTasks: insights.boosterTasks,
    });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// Update booster endpoint (unified)
exports.updateBooster = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!requireCustomerAccess(req, res, customerId)) return;

    const { key, completed } = req.body;
    const valid = [
      "phoneVerified",
      "cardLinked",
      "verifiedReviews",
      "onTimePayments",
      "bankLinked",
      "kyc",
    ];
    if (!valid.includes(key))
      return res.status(400).json({ message: "Unknown booster key" });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // apply semantics
    if (
      key === "phoneVerified" ||
      key === "cardLinked" ||
      key === "bankLinked"
    ) {
      customer.boosters = customer.boosters || {};
      customer.boosters[key] = !!completed;
    } else if (key === "verifiedReviews") {
      customer.boosters = customer.boosters || {};
      customer.boosters.verifiedReviews = completed
        ? (customer.boosters.verifiedReviews || 0) + 1
        : 0;
    } else if (key === "onTimePayments") {
      customer.boosters = customer.boosters || {};
      customer.boosters.onTimePayments = completed
        ? (customer.boosters.onTimePayments || 0) + 1
        : 0;
    } else if (key === "kyc") {
      customer.kycStatus = completed ? "verified" : "unverified";
    }

    await customer.save();

    await pushNotification({
      customerId,
      title: "Booster updated",
      body: `You updated ${key}. Your score will refresh shortly.`,
      type: "booster",
      metadata: { key },
    });

    // Recompute score quickly (non-blocking)
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    await ScoringEvent.create({
      customerId,
      eventType: "booster",
      payload: { booster: key },
    });

    res.json({ success: true, customer: customer });
  } catch (err) {
    console.error("updateBooster error:", err);
    res.status(500).json({ message: "Unable to update booster" });
  }
};

// Return a fresh score explanation with structured reasons
exports.getScoreDetails = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!requireCustomerAccess(req, res, customerId)) return;

    const customer = await Customer.findById(customerId).lean();
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Rule-based baseline
    const ruleResult = calculateScore(customer, orders);

    // Optional AI refinement (best-effort)
    let aiReasons = [];
    let aiScore = ruleResult.score;
    try {
      const aiResponse = await aiAdapter.callModel({
        ruleScore: ruleResult.score,
        features: ruleResult.features,
        recentEvents: orders.slice(0, 5).map((o) => ({
          type: "order",
          status: o.status,
          amount: o.amount,
          createdAt: o.createdAt,
        })),
        eventType: "explain_score",
      });
      aiScore = aiResponse?.score ?? ruleResult.score;
      aiReasons = Array.isArray(aiResponse?.reasons) ? aiResponse.reasons : [];
    } catch (err) {
      console.warn("AI score explanation failed:", err.message || err);
    }

    const combinedReasons = [...aiReasons, ...ruleResult.reasons]
      .map((reason) => ({
        feature: reason.feature || "factor",
        text: reason.text || "Score factor",
        value: reason.value,
        weight: reason.weight ?? 0,
        source: aiReasons.includes(reason) ? "ai" : "rule",
      }))
      .slice(0, 8);

    const finalScore = Math.round(aiScore);
    const level =
      finalScore >= 80 ? "High" : finalScore >= 50 ? "Medium" : "Low";

    return res.json({
      success: true,
      score: finalScore,
      level,
      reasons: combinedReasons,
      reasonsRule: ruleResult.reasons,
      features: ruleResult.features,
    });
  } catch (err) {
    console.error("getScoreDetails error:", err);
    // Even on error, return a default score instead of 500
    return res.json({
      success: false,
      score: 50,
      level: "Medium",
      reasons: [
        { feature: "default", text: "Default score (no data yet)", weight: 0 },
      ],
      reasonsRule: [],
      features: {},
    });
  }
};

exports.getInstallments = async (req, res) => {
  try {
    const { id } = req.params;

    const plans = await InstallmentPlan.find({
      customerId: id,
    }).sort({ createdAt: -1 });

    res.json(plans);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch installments" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id, notificationId } = req.params;
    if (!requireCustomerAccess(req, res, id)) return;

    const Notification = require("../models/Notification");
    // Find notification ensuring it belongs to this customer
    const note = await Notification.findOne({ _id: notificationId, customerId: id });
    
    if (!note) {
        return res.status(404).json({ message: "Notification not found" });
    }

    note.status = "read";
    note.readAt = new Date();
    await note.save();

    res.json({ success: true, message: "Marked as read" });
  } catch(e) {
      console.error(e);
      res.status(500).json({ message: "Action failed" });
  }
};
