// lib/reminderScheduler.js
const InstallmentPlan = require("../models/InstallmentPlan");
const Notification = require("../models/Notification");
const ScoringEvent = require("../models/ScoringEvent");
const Order = require("../models/Order");

async function runOnce() {
  const now = new Date();
  const soonWindowDays = 3;
  const msInDay = 24 * 60 * 60 * 1000;

  const plans = await InstallmentPlan.find({
    status: { $in: ["active", "pending"] },
  }).lean();

  for (const p of plans) {
    if (p.type === "installment") {
      for (const inst of p.schedule) {
        if (inst.status !== "pending") continue;
        const due = new Date(inst.dueDate);
        const diffDays = Math.floor((due.getTime() - now.getTime()) / msInDay);

        if (diffDays <= soonWindowDays && diffDays >= 0) {
          await Notification.create({
            customerId: p.customerId,
            title: "Upcoming installment due",
            body: `Payment of $${inst.amount} for order ${String(
              p.orderId
            ).slice(-6)} is due on ${due.toDateString()}.`,
            type: "reminder",
            read: false,
            metadata: {
              planId: p._id.toString(),
              installmentIndex: inst.index,
            },
          });
        } else if (diffDays < 0) {
          if (!inst.lateNotified) {
            await InstallmentPlan.updateOne(
              { _id: p._id, "schedule.index": inst.index },
              {
                $set: {
                  "schedule.$.lateNotified": true,
                  "schedule.$.late": true,
                },
              }
            );
            await Notification.create({
              customerId: p.customerId,
              title: "Installment overdue",
              body: `Your payment of $${inst.amount} for order ${String(
                p.orderId
              ).slice(-6)} is overdue.`,
              type: "late",
              read: false,
              metadata: {
                planId: p._id.toString(),
                installmentIndex: inst.index,
              },
            });
            await ScoringEvent.create({
              customerId: p.customerId,
              eventType: "installment_late",
              payload: {
                planId: p._id,
                installmentIndex: inst.index,
                amount: inst.amount,
                dueDate: inst.dueDate,
              },
            });
          }
        }
      }
    } else if (p.type === "pay_later_30") {
      // single dueDate
      const due = new Date(p.dueDate);
      const diffDays = Math.floor((due.getTime() - now.getTime()) / msInDay);

      if (diffDays <= 5 && diffDays >= 0) {
        await Notification.create({
          customerId: p.customerId,
          title: "Pay Later due soon",
          body: `Your Pay-Later amount $${p.totalAmount} for order ${String(
            p.orderId
          ).slice(-6)} is due on ${due.toDateString()}.`,
          type: "reminder",
          read: false,
          metadata: { planId: p._id },
        });
      } else if (diffDays < 0) {
        // overdue pay-later
        if (!p.lateNotified) {
          await InstallmentPlan.updateOne(
            { _id: p._id },
            { $set: { lateNotified: true, status: "overdue" } }
          );
          await Notification.create({
            customerId: p.customerId,
            title: "Pay Later overdue",
            body: `Your Pay-Later amount $${p.totalAmount} for order ${String(
              p.orderId
            ).slice(-6)} is overdue.`,
            type: "late",
            read: false,
            metadata: { planId: p._id },
          });
          // apply penalty: create scoring event
          await ScoringEvent.create({
            customerId: p.customerId,
            eventType: "pay_later_overdue",
            payload: {
              planId: p._id,
              orderId: p.orderId,
              amount: p.totalAmount,
              dueDate: p.dueDate,
            },
          });

          // optionally apply immediate late fee to plan (e.g., 5%)
          const lateFee =
            Math.round((p.totalAmount * 0.05 + Number.EPSILON) * 100) / 100;
          await InstallmentPlan.updateOne(
            { _id: p._id },
            {
              $inc: { totalAmount: lateFee },
              $set: { lateFeeApplied: lateFee },
            }
          );
        }
      }
    }
  }
}

let interval = null;
function start(intervalMs = 1000 * 60 * 30) {
  if (interval) return;
  interval = setInterval(() => runOnce().catch(console.error), intervalMs);
  console.log("Reminder scheduler started.");
}
function stop() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

module.exports = { start, stop, runOnce };
