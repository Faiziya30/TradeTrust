const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Score = require("../models/Score");
const InstallmentPlan = require("../models/InstallmentPlan");
const { createInstallmentPlan } = require("../lib/installmentEngine");
const { updateScore } = require("../lib/scoringEngine");
const { pushNotification } = require("../lib/notifications");
const ScoringEvent = require("../models/ScoringEvent");
const { DEFAULT_MERCHANT_ID } = require("../config/constants");

const PAY_LATER_TERMS = [15, 30, 45];

async function createOrder({ user, body }) {
  const {
    items = [],
    amount,
    merchantId,
    paymentOption = "pay_now",
    installmentConfig = {},
    payLaterDays,
  } = body;

  const customerId = user?.customerId;
  if (!customerId) throw new Error("No customer profile attached");

  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Order items required");

  if (!amount || amount <= 0) throw new Error("Invalid amount");

  const lastScore = await Score.findOne({ customerId }).sort({ createdAt: -1 });
  const custScore = lastScore?.score ?? 50;

  const allowInstallment = custScore >= 40;
  const allowPayLater = custScore >= 70;

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

  if (paymentOption === "installment") {
    if (!allowInstallment) {
      const err = new Error("Not eligible for installments");
      err.status = 403;
      throw err;
    }

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

  if (paymentOption === "pay_later") {
    if (!allowPayLater) {
      const err = new Error("Not eligible for Pay Later");
      err.status = 403;
      throw err;
    }

    if (!PAY_LATER_TERMS.includes(payLaterDays)) {
      const err = new Error("Invalid pay-later term");
      err.status = 400;
      throw err;
    }

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

  const customer = await Customer.findById(customerId);
  const orders = await Order.find({ customerId });

  // Recalculate and persist score
  const { scoreDoc } = await updateScore(customer, orders, {
    eventType: "order",
    orderId: order._id,
  });

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

  return { order, plan, scoreDoc };
}

module.exports = { createOrder };
