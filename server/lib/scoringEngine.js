// lib/scoringEngine.js
const Score = require("../models/Score");
const Customer = require("../models/Customer");

// safe number parse
function n(v, fallback = 0) {
  if (v == null) return fallback;
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

// derive features ONLY from orders (source of truth)
function deriveFeatures(customer = {}, orders = []) {
  const sortedOrders = Array.isArray(orders)
    ? orders
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const totalOrders = sortedOrders.length;
  const totalSpent = sortedOrders.reduce((s, o) => s + n(o.amount), 0);
  const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const returns = sortedOrders.filter((o) => o.status === "returned").length;
  const failed = sortedOrders.filter((o) => o.status === "failed").length;
  const chargebacks = sortedOrders.filter(
    (o) => o.status === "chargeback"
  ).length;
  const paid = sortedOrders.filter((o) => o.status === "paid").length;

  const paymentSuccessRate = totalOrders > 0 ? paid / totalOrders : 1;
  const returnRate = totalOrders > 0 ? returns / totalOrders : 0;

  const firstOrderDate = sortedOrders.length
    ? new Date(sortedOrders[sortedOrders.length - 1].createdAt)
    : null;
  const lastOrderDate = sortedOrders.length
    ? new Date(sortedOrders[0].createdAt)
    : null;

  const daysSinceLast = lastOrderDate
    ? Math.max(0, (Date.now() - lastOrderDate.getTime()) / (1000 * 3600 * 24))
    : null;

  const boosters = customer.boosters || {};

  return {
    totalOrders,
    totalSpent,
    avgOrder,
    returnRate,
    paymentSuccessRate,
    failed,
    chargebacks,
    daysSinceLast,
    phoneVerified: Boolean(boosters.phoneVerified),
    cardLinked: Boolean(boosters.cardLinked),
    onTimePayments: boosters.onTimePayments || 0,
    verifiedReviews: boosters.verifiedReviews || 0,
  };
}

function calculateScore(customer = {}, orders = [], options = {}) {
  const { bonusPoints = 0 } = options;
  const features = deriveFeatures(customer, orders);

  let score = 35; // neutral base
  let positivePoints = 0;
  const MAX_POSITIVE = 45;

  const reasons = [];

  function addReason(feature, text, value, weight) {
    reasons.push({ feature, text, value, weight });

    if (weight > 0) {
      const remaining = MAX_POSITIVE - positivePoints;
      const applied = Math.max(0, Math.min(weight, remaining));
      positivePoints += applied;
      score += applied;
    } else {
      score += weight;
    }
  }

  // ---- POSITIVE SIGNALS ----
  if (features.totalOrders > 0) {
    const volWeight = Math.min(12, features.totalOrders * 2);
    addReason(
      "order_volume",
      "Purchase history",
      `${features.totalOrders} orders`,
      volWeight
    );
  }

  if (features.totalOrders > 5)
    addReason("frequency", "Frequent purchases", null, 6);

  if (features.totalSpent > 500)
    addReason(
      "lifetime_value",
      "High lifetime spend",
      `₹${Math.round(features.totalSpent)}`,
      8
    );

  if (features.returnRate < 0.1)
    addReason(
      "low_returns",
      "Low return rate",
      `${Math.round(features.returnRate * 100)}%`,
      6
    );

  if (features.paymentSuccessRate > 0.9)
    addReason(
      "payment_success",
      "High payment success",
      `${Math.round(features.paymentSuccessRate * 100)}%`,
      6
    );

  if (features.phoneVerified)
    addReason("phone_verified", "Phone verified", null, 8);

  if (features.cardLinked) addReason("card_linked", "Card linked", null, 5);

  if (features.onTimePayments > 0) {
    const add = Math.min(12, features.onTimePayments * 3);
    addReason("on_time_payments", "On-time payments", null, add);
  }

  if (features.verifiedReviews > 0) {
    const add = Math.min(6, features.verifiedReviews * 2);
    addReason("verified_reviews", "Verified reviews", null, add);
  }

  // ---- NEGATIVE SIGNALS ----
  if (features.chargebacks > 0) {
    addReason(
      "chargebacks",
      "Chargeback history",
      `${features.chargebacks}`,
      -30
    );
  }

  if (features.failed > 0) {
    addReason("failed_payments", "Failed payments", `${features.failed}`, -12);
  }

  if (features.daysSinceLast != null && features.daysSinceLast > 30) {
    addReason(
      "inactive",
      "Inactive for long period",
      `${Math.round(features.daysSinceLast)} days`,
      -5
    );
  }

  // Apply manual bonus points (e.g. from immediate event)
  if (bonusPoints !== 0) {
    // We don't use addReason here to avoid capping logic issues, just raw adjust
    score += bonusPoints;
    reasons.push({
      feature: "event_bonus",
      text: bonusPoints > 0 ? "Recent positive activity" : "Recent penalty",
      value: bonusPoints > 0 ? `+${bonusPoints}` : `${bonusPoints}`,
      weight: bonusPoints,
    });
  }

  score = Math.max(0, Math.min(100, score));

  const level = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";

  return {
    score: Math.round(score),
    level,
    reasons,
    features,
  };
}

module.exports = {
  deriveFeatures,
  calculateScore,
  // updateScore: compute rule-score, persist Score doc and update customer summary
  async updateScore(customer = {}, orders = [], meta = {}, options = {}) {
    try {
      const result = calculateScore(customer, orders, options);

      const scoreDoc = await Score.create({
        customerId: customer._id,
        score: result.score,
        level: result.level,
        reasons: (result.reasons || []).map((r) => r.text || r.feature),
        reasonsRule: result.reasons || [],
        eventType: meta.eventType || "rule",
        meta: meta || {},
      });

      // update customer quick fields
      try {
        await Customer.findByIdAndUpdate(customer._id, {
          $set: {
            lastScore: result.score,
            lastScoreReasons: (result.reasons || []).map(
              (r) => r.text || r.feature
            ),
            totalOrders: orders.length,
            totalSpent: orders.reduce((s, o) => s + (o.amount || 0), 0),
            returnRate:
              orders.filter((o) => o.status === "returned").length /
              Math.max(1, orders.length),
            paymentSuccessRate:
              orders.filter((o) => o.status === "paid").length /
              Math.max(1, orders.length),
            chargebacks: orders.filter((o) => o.status === "chargeback").length,
          },
        });
      } catch (e) {
        console.warn("Could not update customer summary fields:", e.message);
      }

      return { scoreDoc, result };
    } catch (e) {
      console.error("updateScore error:", e);
      throw e;
    }
  },
};
