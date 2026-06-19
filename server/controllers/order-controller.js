const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Score = require("../models/Score");
const InstallmentPlan = require("../models/InstallmentPlan");
const { createInstallmentPlan } = require("../lib/installmentEngine");
const { updateScore } = require("../lib/scoringEngine");
const { pushNotification } = require("../lib/notifications");
const ScoringEvent = require("../models/ScoringEvent");

const { DEFAULT_MERCHANT_ID } = require("../config/constants");

// GLOBAL PAY LATER CONFIG
const PAY_LATER_TERMS = [15, 30, 45]; // days allowed

const handleOrder = async (req, res) => {
  try {
    const {
      items = [],
      amount,
      merchantId,
      paymentOption = "pay_now",
      installmentConfig = {},
      payLaterDays,
    } = req.body;

    const customerId = req.user?.customerId;
    if (!customerId)
      return res.status(400).json({ message: "No customer profile attached" });

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Order items required" });

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    // Score lookup
    const lastScore = await Score.findOne({ customerId }).sort({
      createdAt: -1,
    });
    const custScore = lastScore?.score ?? 50;

    // Eligibility:
    const allowInstallment = custScore >= 40;
    const allowPayLater = custScore >= 70;

    // Create order (status depends on paymentOption)
    let orderStatus = "paid";
    if (paymentOption !== "pay_now") orderStatus = "pending";

    const order = await Order.create({
      customerId,
      merchantId: merchantId || DEFAULT_MERCHANT_ID,
      items,
      amount,
      paymentOption,
      status: orderStatus,
    });

    let plan = null;

    // 🔥 INSTALLMENT LOGIC
    if (paymentOption === "installment") {
      if (!allowInstallment)
        return res
          .status(403)
          .json({ message: "Not eligible for installments" });

      plan = await createInstallmentPlan(order, {
        count: installmentConfig.count || 4,
        score: custScore,
      });

      await pushNotification({
        customerId,
        title: "Installment Plan Created",
        body: `Your order is split into ${plan.schedule.length} payments.`,
      });
    }

    // 🔥 PAY LATER LOGIC — FIXED & CORRECT
    if (paymentOption === "pay_later") {
      if (!allowPayLater)
        return res.status(403).json({ message: "Not eligible for Pay Later" });

      if (!PAY_LATER_TERMS.includes(payLaterDays))
        return res.status(400).json({ message: "Invalid pay-later term" });

      const due = new Date(Date.now() + payLaterDays * 24 * 60 * 60 * 1000);

      plan = await InstallmentPlan.create({
        type: "pay_later",
        customerId,
        orderId: order._id,
        totalAmount: amount,
        status: "pending",
        dueDate: due,
        schedule: [],
      });

      await pushNotification({
        customerId,
        title: "Pay Later Approved",
        body: `Your payment of ₹${amount} is due in ${payLaterDays} days.`,
      });
    }

    // update scoring immediately (rule engine) and enqueue event for worker/AI blend
    const customer = await Customer.findById(customerId);
    const orders = await Order.find({ customerId });

    console.log(
      `[ORDER] Created order. About to updateScore for customerId=${customerId}, orders=${orders.length}`
    );

    // immediately recalculate and persist the score based on new order
    const { scoreDoc } = await updateScore(customer, orders, {
      eventType: "order",
      orderId: order._id,
    });
    console.log(`[ORDER] updateScore returned score=${scoreDoc?.score}`);

    // also enqueue scoring event for async worker (includes AI blend & penalties/rewards)
    await ScoringEvent.create({
      customerId,
      eventType: "order",
      payload: {
        orderId: order._id,
        amount,
        paymentOption,
        status: order.status,
      },
    });

    return res.json({ success: true, order, plan });
  } catch (e) {
    console.error("Order create error:", e);
    res.status(500).json({ message: "Order creation failed" });
  }
};

module.exports = handleOrder;
