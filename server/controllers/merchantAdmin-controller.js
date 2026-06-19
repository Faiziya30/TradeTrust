// controllers/merchantAdminController.js
const User = require("../models/User"); // merchants+customers
const Customer = require("../models/Customer");
const Score = require("../models/Score");
const InstallmentPlan = require("../models/InstallmentPlan");

// mask helper
function maskEmail(email) {
  if (!email) return "";
  const parts = email.split("@");
  const name = parts[0];
  const maskedName =
    name.length <= 2
      ? name[0] + "*"
      : name[0] + "*".repeat(Math.min(3, name.length - 1)) + name.slice(-1);
  return `${maskedName}@${parts[1] || "hidden"}`;
}
function maskName(n) {
  if (!n) return "";
  const parts = n.split(" ");
  return parts
    .map((p) =>
      p.length <= 2
        ? p[0] + "*"
        : p[0] + "*".repeat(Math.min(2, p.length - 1)) + p.slice(-1)
    )
    .join(" ");
}

// POST /api/merchant/threshold
async function setThreshold(req, res) {
  try {
    const merchantUser = req.user;
    const { threshold } = req.body;
    if (typeof threshold !== "number")
      return res.status(400).json({ message: "threshold must be number" });
    merchantUser.payLaterThreshold = threshold;
    await merchantUser.save();
    return res.json({
      success: true,
      merchant: { id: merchantUser._id, payLaterThreshold: threshold },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "failed" });
  }
}

// GET /api/merchant/customers
async function listCustomers(req, res) {
  try {
    // find customers by your logic: either Customer model linked to User, or User role.
    // Here we look up combined User model where role === 'customer' (adjust if your project stores separately)
    const users = await User.find({ role: "customer" })
      .lean()
      .limit(200)
      .sort({ createdAt: -1 });
    // for each user, attach lastScore preview
    const results = [];
    for (const u of users) {
      const lastScore = await Score.findOne({ customerId: u._id })
        .sort({ createdAt: -1 })
        .lean();
      const plans = await InstallmentPlan.find({ customerId: u._id }).lean();
      results.push({
        id: u._id,
        name: maskName(u.name),
        email: maskEmail(u.email),
        lastScore: lastScore?.score ?? null,
        lastScoreAt: lastScore?.createdAt ?? null,
        activePlans: plans.filter((p) => p.status === "active").length,
      });
    }
    res.json({ success: true, customers: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "failed" });
  }
}

// GET /api/merchant/customers/:customerId
async function getCustomerSummary(req, res) {
  try {
    const { customerId } = req.params;
    const u = await User.findById(customerId).lean();
    if (!u) return res.status(404).json({ message: "not found" });

    const lastScore = await Score.findOne({ customerId })
      .sort({ createdAt: -1 })
      .lean();
    const plans = await InstallmentPlan.find({ customerId }).lean();
    // mask sensitive user data
    const safe = {
      id: u._id,
      name: maskName(u.name),
      email: maskEmail(u.email),
      lastScore: lastScore?.score ?? null,
      lastScoreAt: lastScore?.createdAt ?? null,
      plans: plans.map((p) => ({
        id: p._id,
        type: p.type,
        status: p.status,
        totalAmount: p.totalAmount,
        dueDate: p.dueDate,
      })),
    };
    return res.json({ success: true, customer: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "failed" });
  }
}

module.exports = { setThreshold, listCustomers, getCustomerSummary };
