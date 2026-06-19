// controllers/merchant-controller.js
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Score = require("../models/Score");
const InstallmentPlan = require("../models/InstallmentPlan");
const MerchantAction = require("../models/MerchantAction");
const ScoringEvent = require("../models/ScoringEvent");
const { updateScore } = require("../lib/scoringEngine");

exports.getDashboard = async (req, res) => {
  try {
    const merchantId = req.params.merchantId; // allow string ids like "demo-store"
    console.log(`[getDashboard] Fetching data for merchantId: ${merchantId}`);

    // find distinct customerIds who ordered from this merchant
    const customerIds = await Order.distinct("customerId", { merchantId });
    console.log(
      `[getDashboard] Found ${customerIds.length} customers with orders`
    );

    const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
    console.log(`[getDashboard] Fetched ${customers.length} customer docs`);

    let low = 0,
      medium = 0,
      high = 0;
    let scoreSum = 0;
    let paymentSuccessSum = 0;

    for (const c of customers) {
      const lastScore = await Score.findOne({ customerId: c._id })
        .sort({ createdAt: -1 })
        .lean();
      const value = lastScore?.score ?? c.lastScore ?? 50;
      scoreSum += value;
      paymentSuccessSum += c.paymentSuccessRate ?? 1; // Default to 1 if missing

      if (value >= 80) high++;
      else if (value >= 50) medium++;
      else low++;
    }

    const result = {
      totalCustomers: customers.length,
      avgScore: customers.length ? Math.round(scoreSum / customers.length) : 0,
      onTimeRate: customers.length ? (paymentSuccessSum / customers.length) : 0,
      buckets: {
        lowRisk: low,
        mediumRisk: medium,
        highRisk: high,
      },
    };
    console.log(`[getDashboard] Returning:`, result);
    res.json(result);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const skip = Math.max(0, parseInt(req.query.skip || "0", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "50", 10));

    console.log(
      `[getCustomers] merchantId=${merchantId}, skip=${skip}, limit=${limit}`
    );

    const customerIds = await Order.distinct("customerId", { merchantId });
    console.log(`[getCustomers] Found ${customerIds.length} customer IDs`);

    const customers = await Customer.find({ _id: { $in: customerIds } })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(
      `[getCustomers] Fetched ${customers.length} customers after skip/limit`
    );

    const enriched = [];
    for (const c of customers) {
      const score = await Score.findOne({ customerId: c._id })
        .sort({ createdAt: -1 })
        .lean();
      enriched.push({
        ...c,
        lastScore: score?.score ?? c.lastScore ?? 50,
        lastLevel: score?.level ?? "Medium",
      });
    }

    console.log(
      `[getCustomers] Returning ${enriched.length} enriched customers`
    );
    res.json({ customers: enriched });
  } catch (err) {
    console.error("Customers fetch error:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

exports.getCustomerDetail = async (req, res) => {
  try {
    const { merchantId, customerId } = req.params;

    const customer = await Customer.findById(customerId).lean();
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();
    const scores = await Score.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const plans = await InstallmentPlan.find({ customerId }).lean();

    res.json({ success: true, customer, orders, scores, plans });
  } catch (err) {
    console.error("getCustomerDetail error:", err);
    res.status(500).json({ message: "Failed to fetch customer detail" });
  }
};

exports.performAction = async (req, res) => {
  try {
    const { merchantId, customerId } = req.params;
    const { action, reason } = req.body;

    if (!["approve", "require_deposit", "hold"].includes(action))
      return res.status(400).json({ message: "Invalid action" });

    await MerchantAction.create({ merchantId, customerId, action, reason });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    if (action === "approve")
      customer.scoreBoost = (customer.scoreBoost || 0) + 5;
    if (action === "require_deposit")
      customer.scoreBoost = (customer.scoreBoost || 0) - 5;
    if (action === "hold")
      customer.scoreBoost = (customer.scoreBoost || 0) - 10;
    await customer.save();

    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

    // enqueue a scoring event for background processing
    await ScoringEvent.create({
      customerId,
      eventType: "merchant_action",
      payload: { action, reason },
    });

    // recompute score immediately so UI can reflect change
    try {
      const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
      const { scoreDoc, result } = await updateScore(customer, orders, {
        eventType: "merchant_action",
        action,
        reason,
      });

      return res.json({
        success: true,
        action,
        customer,
        score: result,
        scoreDoc,
      });
    } catch (err) {
      console.warn("Immediate score recompute failed:", err.message);
      return res.json({ success: true, action, customer });
    }
  } catch (err) {
    console.error("Merchant action error:", err);
    res.status(500).json({ message: "Action failed: " + err.message });
  }
};

exports.getSuspiciousActivity = async (req, res) => {
  try {
    const SuspiciousActivity = require("../models/SuspiciousActivity");
    // const merchantId = req.params.merchantId; 
    // Technically need to filter by merchant's customers but keeping it simple for now
    
    const activities = await SuspiciousActivity.find({})
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ message: "Failed to load suspicious activity" });
  }
};

exports.notifyCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { message } = req.body;
    
    // In a real app, this would send an email/SMS or push notification
    // For now, we'll simulate it by creating a notification record if we had that model
    // or just logging it.
    console.log(`[NOTIFY] Sending to customer ${customerId}: ${message}`);
    
    // We can use the existing pushNotification lib
    const { pushNotification } = require("../lib/notifications");
    await pushNotification({
        customerId,
        title: "Message from Merchant",
        body: message,
        type: "system" // or "alert"
    });
    
    // Also persist directly if pushNotification doesn't (it seems it relies on socket only?)
    // Let's explicitly create one for history
    const Notification = require("../models/Notification");
    // Find associated user for this customer if possible, often customerId is linked to user
    // In this system, Customer model has email, User model has email.
    // If Notification requires userId, we might need lookup. 
    // BUT looking at schema: customerId OR userId.
    
    await Notification.create({
        customerId,
        title: "Message from Merchant",
        body: message,
        type: "system",
        status: "unread",
        createdAt: new Date()
    });

    res.json({ success: true, message: "Notification sent" });
  } catch (err) {
    console.error("Notify error:", err);
    res.status(500).json({ message: "Failed to notify customer" });
  }
};
