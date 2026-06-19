// lib/installmentEngine.js
const InstallmentPlan = require("../models/InstallmentPlan");
const Order = require("../models/Order");
const { deriveFeatures } = require("./scoringEngine");

// helper to choose interest based on score
function interestForScore(score, forInstallment = true) {
  // installment interest tiers
  if (forInstallment) {
    if (score >= 80) return 0.03; // 3%
    if (score >= 60) return 0.07; // 7%
    if (score >= 40) return 0.12; // 12%
    return null; // not eligible
  } else {
    // pay_later (net-30) is typically 0% for good customers
    if (score >= 70) return 0.0;
    return null; // not eligible
  }
}

// create installment plan for an order (installments)
async function createInstallmentPlan(order, opts = {}) {
  const {
    count = 4,
    scheduleConfig = null,
    customer = null,
    score = null,
  } = opts;
  // if score provided, determine interest
  const interestRate =
    typeof score === "number" ? interestForScore(score, true) : 0.07;

  if (interestRate == null)
    throw new Error(
      "Customer not eligible for installment plan based on score"
    );

  const base = Number(order.amount || 0);
  const totalAmount = +(base * (1 + interestRate)).toFixed(2);
  const per = +(totalAmount / count).toFixed(2);

  const schedule = [];
  const start = new Date(Date.now() + 24 * 3600 * 1000); // Start from tomorrow
  const intervalDays =
    scheduleConfig && scheduleConfig.intervalDays
      ? Number(scheduleConfig.intervalDays)
      : 14;

  for (let i = 0; i < count; i++) {
    const due = new Date(start.getTime() + intervalDays * i * 24 * 3600 * 1000);
    schedule.push({
      index: i,
      dueDate: due,
      amount: per,
      status: "pending",
      paidAt: null,
      late: false,
    });
  }

  const plan = await InstallmentPlan.create({
    customerId: order.customerId,
    orderId: order._id,
    paymentOption: "installment",
    type: "installment",
    schedule,
    totalAmount,
    interestRate,
    status: "active",
    createdAt: new Date(),
  });

  return plan;
}

// create pay-later (net-30) plan
async function createPayLater30(order, opts = {}) {
  const { customer = null, score = null, days = 30 } = opts;
  const interestRate =
    typeof score === "number" ? interestForScore(score, false) : null;
  if (interestRate == null) throw new Error("Not eligible for Pay-Later 30");

  const base = Number(order.amount || 0);
  const totalAmount = +(base * (1 + interestRate)).toFixed(2);
  const dueDate = new Date(Date.now() + days * 24 * 3600 * 1000);

  const plan = await InstallmentPlan.create({
    customerId: order.customerId,
    orderId: order._id,
    paymentOption: "pay_later_30",
    type: "pay_later_30",
    dueDate,
    totalAmount,
    interestRate,
    status: "pending",
    createdAt: new Date(),
  });

  return plan;
}

module.exports = { createInstallmentPlan, createPayLater30, interestForScore };
