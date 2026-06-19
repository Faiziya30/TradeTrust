const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Score = require("../models/Score");
const Notification = require("../models/Notification");
const InstallmentPlan = require("../models/InstallmentPlan");
const { updateScore } = require("./scoringEngine");

function buildRecommendations(customer = {}, stats = {}) {
  const tips = [];
  const boosters = customer.boosters || {};
  const orderStats = stats.orderStats || {};
  const returnRate = customer.returnRate ?? orderStats.returnRate ?? 0;
  const paymentSuccess =
    customer.paymentSuccessRate ?? orderStats.paymentSuccessRate ?? 1;

  if (!boosters.phoneVerified) {
    tips.push("Verify your phone number to unlock a +10 score boost.");
  }
  if (!boosters.cardLinked) {
    tips.push("Link a payment card to show stability and gain +5 points.");
  }
  if ((boosters.onTimePayments || 0) < 3) {
    tips.push(
      "Keep completing purchases on time — each on-time repayment boosts your score."
    );
  }
  if ((boosters.verifiedReviews || 0) < 2) {
    tips.push("Share verified reviews to strengthen your trust signal.");
  }
  if (returnRate > 0.2) {
    tips.push(
      "Your return rate is high. Reduce returns to avoid negative score impact."
    );
  } else if (returnRate > 0.1) {
    tips.push("Keep returns under 10% to move into the low-risk tier.");
  }
  if (paymentSuccess < 0.9) {
    tips.push(
      "Improve payment success (>= 90%) by keeping cards funded and resolving declines quickly."
    );
  }
  if ((customer.chargebacks || 0) > 0) {
    tips.push(
      "Chargebacks hurt the score heavily. Work with support to resolve open disputes."
    );
  }
  if ((customer.totalOrders || 0) < 3) {
    tips.push("Add a few more successful orders to build more credit history.");
  }

  if (!tips.length) {
    tips.push(
      "Great job! Keep payments on time and maintain low returns to continue climbing."
    );
  }
  return tips.slice(0, 5);
}

function normalizeReasons(customerDoc = {}, fallback = []) {
  const toObjects = (arr = []) =>
    arr
      .filter(Boolean)
      .slice(0, 5)
      .map((entry) =>
        typeof entry === "string"
          ? { feature: "legacy", text: entry }
          : {
              feature: entry.feature || "legacy",
              text: entry.text || String(entry),
              value: entry.value,
            }
      );

  if (
    Array.isArray(customerDoc.lastScoreReasons) &&
    customerDoc.lastScoreReasons.length
  ) {
    return toObjects(customerDoc.lastScoreReasons);
  }
  if (Array.isArray(fallback) && fallback.length) {
    return toObjects(fallback);
  }
  return [];
}

function buildOrderStats(customer = {}, orders = []) {
  // Always calculate fresh from orders, don't use stale cached values
  const totalOrders = orders.length;
  const totalSpent = orders.reduce(
    (sum, order) => sum + (order.amount || 0),
    0
  );
  const paymentSuccessRate =
    totalOrders > 0
      ? orders.filter((o) => o.status === "paid").length / totalOrders
      : 1;
  const returnRate =
    totalOrders > 0
      ? orders.filter((o) => o.status === "returned").length / totalOrders
      : 0;

  return {
    totalOrders,
    totalSpent: Math.round(totalSpent * 100) / 100,
    avgOrderValue:
      totalOrders > 0 ? Math.round((totalSpent / totalOrders) * 100) / 100 : 0,
    paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
    returnRate: Math.round(returnRate * 100) / 100,
    lastOrderAt: orders[0]?.createdAt || null,
  };
}

function buildBoosterTasks(customer = {}, orders = []) {
  const boosters = customer.boosters || {};
  const orderStats = buildOrderStats(customer, orders);
  const daysSinceJoin = (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  const tasks = [
    {
      key: "profile_complete",
      label: "Complete Profile",
      description: "Add your full name, email, and phone number.",
      completed: Boolean(customer.name && customer.email && customer.phone),
      action: "edit_profile",
      progress: [customer.name, customer.email, customer.phone].filter(Boolean).length,
      total: 3,
      boostAmount: 10
    },
    {
      key: "kyc_verified",
      label: "Verify Identity",
      description: "Upload government ID to verify your identity.",
      completed: customer.kycStatus === "verified",
      action: "verify_kyc",
      boostAmount: 20
    },
    {
      key: "first_order",
      label: "First Purchase",
      description: "Complete your first order to start your history.",
      completed: orders.length > 0,
      action: "shop_now",
      boostAmount: 15
    },
    {
      key: "loyal_shopper",
      label: "Loyal Shopper",
      description: "Complete 5 or more orders.",
      completed: orders.length >= 5,
      progress: orders.length,
      total: 5,
      boostAmount: 25
    },
    {
      key: "low_returns",
      label: "Smart Shopper",
      description: "Maintain a return rate below 10% (min 3 orders).",
      completed: orders.length >= 3 && orderStats.returnRate <= 0.10,
      progress: orders.length >= 3 ? Math.round((1 - orderStats.returnRate) * 100) : 0,
      total: 100, // represent as %
      isPercentage: true,
      boostAmount: 30
    },
    {
      key: "payment_star",
      label: "Payment Star",
      description: "Maintain 95% payment success rate (min 3 orders).",
      completed: orders.length >= 3 && orderStats.paymentSuccessRate >= 0.95,
      boostAmount: 20
    },
    {
      key: "veteran_member",
      label: "TrustCart Veteran",
      description: "Be a member for at least 30 days.",
      completed: daysSinceJoin >= 30,
      progress: Math.floor(daysSinceJoin),
      total: 30,
      boostAmount: 15
    }
  ];
  return tasks;
}

async function collectCustomerInsights(customerId, opts = {}) {
  const {
    scoreLimit = 25,
    orderLimit = 25,
    notificationLimit = 10,
    installmentLimit = 10,
  } = opts;
  const skipRefresh = Boolean(opts.skipRefresh);
  const customer = await Customer.findById(customerId).lean();
  if (!customer) return null;
  console.log(`[collectCustomerInsights] customerId=${customerId}`);
  let [scores, orders, notifications, installments] = await Promise.all([
    Score.find({ customerId }).sort({ createdAt: -1 }).limit(scoreLimit).lean(),
    Order.find({ customerId }).sort({ createdAt: -1 }).limit(orderLimit).lean(),
    Notification.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(notificationLimit)
      .lean(),
    InstallmentPlan.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(installmentLimit)
      .lean(),
  ]);

  console.log(
    `[collectCustomerInsights] scores=${scores.length}, orders=${orders.length}, latestScore=${scores[0]?.score}`
  );

  // Get ALL orders for accurate stats calculation (not just the limited display set)
  // Populate items.productId to get names
  const allOrders = await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .populate("items.productId", "name price images")
    .lean();
    
  // Also populate the limited set 'orders' used for display
   orders = await Order.find({ customerId })
        .sort({ createdAt: -1 })
        .limit(orderLimit)
        .populate("items.productId", "name price images")
        .lean();


  // Safety net: if no scores yet or score is older than the latest order, recompute now.
  const latestOrderAt = orders[0]?.createdAt
    ? new Date(orders[0].createdAt)
    : null;
  const latestScoreAt = scores[0]?.createdAt
    ? new Date(scores[0].createdAt)
    : null;
  const ONE_MIN = 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const staleScore =
    latestScoreAt && Date.now() - latestScoreAt.getTime() > ONE_DAY;
  const needsRefresh = (!scores.length || staleScore) && !skipRefresh;

  if (needsRefresh) {
    try {
      const customerDoc = await Customer.findById(customerId);
      // const allOrders = await Order.find({ customerId }).sort({
      //   createdAt: -1,
      // });
      // Already fetched allOrders with population, but updateScore expects raw docs or lean?
      // updateScore logic might need raw docs if it saves them... actually it usually just reads.
      
      const { scoreDoc } = await updateScore(customerDoc, allOrders, {
        eventType: "on_demand_profile_refresh",
      });
      // prepend fresh score for downstream mapping
      scores = [scoreDoc.toObject(), ...scores];
    } catch (e) {
      console.warn("on-demand score refresh failed:", e.message);
    }
  }

  const latestScoreDoc = scores[0] || null;
  const previousScore = scores[1]?.score ?? null;
  const scoreHistory = scores.map((s) => ({
    id: s._id,
    score: s.score,
    level: s.level,
    eventType: s.eventType,
    createdAt: s.createdAt,
  }));

  const latestScore = latestScoreDoc
    ? {
        score: latestScoreDoc.score,
        level: latestScoreDoc.level,
        createdAt: latestScoreDoc.createdAt,
      }
    : null;

  const trend =
    latestScore && previousScore != null
      ? latestScore.score - previousScore
      : null;
  const orderStats = buildOrderStats(customer, allOrders);
  const recommendations = buildRecommendations(customer, { orderStats });
  const reasons = normalizeReasons(customer, latestScoreDoc?.reasons);
  const sanitizedOrders = orders.map((order) => ({
    id: order._id,
    amount: order.amount,
    status: order.status,
    returnStatus: order.returnStatus,
    merchantId: order.merchantId,
    createdAt: order.createdAt,
    items: order.items,
  }));

  const notificationCount = await Notification.countDocuments({
    customerId,
    status: "unread",
  });

  const sanitizedNotifications = notifications.map((note) => ({
    id: note._id,
    title: note.title,
    body: note.body,
    type: note.type,
    status: note.status,
    createdAt: note.createdAt,
  }));

  const sanitizedInstallments = installments.map((plan) => ({
    id: plan._id,
    orderId: plan.orderId,
    paymentOption: plan.paymentOption,
    totalAmount: plan.totalAmount,
    status: plan.status,
    schedule: plan.schedule,
  }));

  return {
    customer,
    scores,
    orders,
    latestScore,
    latestScoreDoc,
    previousScore,
    trend,
    orderStats,
    recommendations,
    reasons,
    scoreHistory,
    sanitizedOrders,
    notifications: sanitizedNotifications, // Now includes sanitized
    unreadNotifications: notificationCount,
    installmentPlans: sanitizedInstallments,
    boosterTasks: buildBoosterTasks(customer, allOrders),
  };
}

module.exports = {
  buildRecommendations,
  normalizeReasons,
  buildOrderStats,
  buildBoosterTasks,
  collectCustomerInsights,
};
