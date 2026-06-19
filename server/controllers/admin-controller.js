const User = require("../models/User");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Score = require("../models/Score");
const InstallmentPlan = require("../models/InstallmentPlan");

// list platform users (customers)
async function listUsers(req, res) {
  try {
    const users = await User.find({ role: "customer" })
      .lean()
      .limit(500)
      .sort({ createdAt: -1 });

    const results = [];
    for (const u of users) {
      const lastScore = await Score.findOne({ customerId: u._id })
        .sort({ createdAt: -1 })
        .lean();
      const plans = await InstallmentPlan.find({ customerId: u._id }).lean();
      results.push({
        id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        lastScore: lastScore?.score ?? null,
        lastScoreAt: lastScore?.createdAt ?? null,
        activePlans: plans.filter((p) => p.status === "active").length,
      });
    }

    res.json({ success: true, users: results });
  } catch (err) {
    console.error("admin listUsers error:", err);
    res.status(500).json({ message: "failed" });
  }
}

// get full user detail including orders, score history, installments
async function getUserDetail(req, res) {
  try {
    const { userId } = req.params;
    const u = await User.findById(userId).lean();
    if (!u) return res.status(404).json({ message: "not found" });

    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .lean();
    const scores = await Score.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const plans = await InstallmentPlan.find({ customerId: userId }).lean();

    res.json({ success: true, user: u, orders, scores, plans });
  } catch (err) {
    console.error("admin getUserDetail error:", err);
    res.status(500).json({ message: "failed" });
  }
}

module.exports = { listUsers, getUserDetail };
