// lib/scoringWorker.js
const ScoringEvent = require("../models/ScoringEvent");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Score = require("../models/Score");
const { calculateScore } = require("./scoringEngine");

let running = false;
const POLL_MS = 3000;

async function processOne(event) {
  try {
    const customer = await Customer.findById(event.customerId);
    if (!customer) throw new Error("Customer not found");

    const orders = await Order.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // FIRST EVER SCORE (bootstrap)
    const hasScore = await Score.exists({ customerId: customer._id });
    if (!hasScore && orders.length === 0) {
      await Score.create({
        customerId: customer._id,
        score: 35,
        level: "Low",
        reasons: ["Initial profile created"],
        eventType: "initial",
      });

      event.processed = true;
      event.processedAt = new Date();
      await event.save();
      return;
    }

    const ruleResult = calculateScore(customer, orders);
    let finalScore = ruleResult.score;

    // event-based adjustments
    if (event.eventType === "installment_payment") {
      finalScore += event.payload?.late ? -10 : 5;
    }
    if (event.eventType === "pay_later_payment") {
      finalScore += event.payload?.late ? -20 : 8;
    }
    if (event.eventType === "order_returned") {
      finalScore -= 10;
    }

    finalScore = Math.max(0, Math.min(100, finalScore));

    const scoreDoc = await Score.create({
      customerId: customer._id,
      score: finalScore,
      level: finalScore >= 80 ? "High" : finalScore >= 50 ? "Medium" : "Low",
      reasons: ruleResult.reasons.map((r) => r.text),
      reasonsRule: ruleResult.reasons,
      eventType: event.eventType,
      meta: event.payload,
    });

    await Customer.findByIdAndUpdate(customer._id, {
      lastScore: finalScore,
      lastScoreAt: new Date(),
      lastScoreReasons: ruleResult.reasons.map((r) => r.text),
    });

    event.processed = true;
    event.processedAt = new Date();
    await event.save();

    return scoreDoc;
  } catch (err) {
    console.error("processOne error:", err);

    try {
      event.error = err.message;
      event.processed = true;
      event.processedAt = new Date();
      await event.save();
    } catch (_) {}

    return null;
  }
}

async function pollLoop() {
  if (running) return;
  running = true;

  while (running) {
    try {
      const event = await ScoringEvent.findOne({
        processed: false,
        error: { $exists: false },
      })
        .sort({ createdAt: 1 })
        .exec();

      if (event) {
        await processOne(event);
      } else {
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch (err) {
      console.error("worker loop error:", err);
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

function start() {
  if (!running) {
    pollLoop();
    console.log("Scoring worker started (DB poll).");
  }
}

function stop() {
  running = false;
}

module.exports = { start, stop };
