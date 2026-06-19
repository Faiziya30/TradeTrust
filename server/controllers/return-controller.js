// controllers/return-controller.js
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const ScoringEvent = require("../models/ScoringEvent");
const { updateScore } = require("../lib/scoringEngine");

// Customer -> request a return
async function requestReturn(req, res) {
  try {
    const orderId = req.params.id;
    console.log("Incoming return ID:", orderId);
    const { reason } = req.body;
    const userCustomerId = req.user?.customerId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    console.log("Found order:", order?._id);

    // Only the order owner can request return
    if (String(order.customerId) !== String(userCustomerId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Only allow returns on completed / fulfilled orders, not pending or failed
    const disallowedStatuses = ["pending", "failed", "chargeback"];
    if (disallowedStatuses.includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Only completed orders can be returned" });
    }

    // Only allow if not already returned/approved
    if (
      order.returnStatus === "approved" ||
      order.returnStatus === "rejected" ||
      order.returnStatus === "requested"
    ) {
      return res.status(400).json({ message: "Return already processed" });
    }

    order.returnStatus = "requested";
    order.returnReason = reason || "";
    order.returnRequestedAt = new Date();
    await order.save();

    // create scoring event: small penalty for request
    await ScoringEvent.create({
      customerId: order.customerId,
      eventType: "return_requested",
      payload: { orderId: order._id, reason: order.returnReason },
    });

    // immediate refresh so score moves without waiting for worker
    try {
      const customer = await Customer.findById(order.customerId);
      const orders = await Order.find({ customerId: order.customerId }).sort({
        createdAt: -1,
      });
      await ScoringEvent.create({
        customerId: order.customerId,
        eventType: "return_requested",
        payload: {
          orderId: order._id,
          reason: order.returnReason,
        },
      });
    } catch (err) {
      console.warn("return request score refresh failed:", err.message);
    }

    return res.json({ success: true, order });
  } catch (e) {
    console.error("requestReturn error:", e);
    return res.status(500).json({ message: "Request failed" });
  }
}

// Admin -> approve return
async function approveReturn(req, res) {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnStatus !== "requested")
      return res.status(400).json({ message: "No pending return to approve" });

    order.returnStatus = "approved";
    order.status = "returned";
    order.returnApprovedAt = new Date();
    await order.save();

    // scoring event: stronger penalty for an actual return
    await ScoringEvent.create({
      customerId: order.customerId,
      eventType: "order_returned",
      payload: { orderId: order._id },
    });

    // immediately recalc score so UI reflects penalty
    try {
      const customer = await Customer.findById(order.customerId);
      const orders = await Order.find({ customerId: order.customerId }).sort({
        createdAt: -1,
      });
      await ScoringEvent.create({
        customerId: order.customerId,
        eventType: "order_returned",
        payload: {
          orderId: order._id,
        },
      });
    } catch (err) {
      console.warn("Could not update score after return approve:", err.message);
    }

    return res.json({ success: true, order });
  } catch (e) {
    console.error("approveReturn error:", e);
    return res.status(500).json({ message: "Approve failed" });
  }
}

// Admin -> reject return
async function rejectReturn(req, res) {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnStatus !== "requested")
      return res.status(400).json({ message: "No pending return to reject" });

    order.returnStatus = "rejected";
    await order.save();

    // no scoring event on rejection (per your spec)
    // still refresh to keep latest score surface
    try {
      const customer = await Customer.findById(order.customerId);
      const orders = await Order.find({ customerId: order.customerId }).sort({
        createdAt: -1,
      });
      await updateScore(customer, orders, {
        eventType: "return_rejected",
        orderId: order._id,
      });
    } catch (err) {
      console.warn("Could not update score after return reject:", err.message);
    }
    return res.json({ success: true, order });
  } catch (e) {
    console.error("rejectReturn error:", e);
    return res.status(500).json({ message: "Reject failed" });
  }
}

// Merchant -> list pending returns
async function listPendingReturns(req, res) {
  try {
    const orders = await Order.find({ returnStatus: "requested" })
      .sort({ returnRequestedAt: -1 })
      .lean();
    return res.json({ success: true, orders });
  } catch (e) {
    console.error("listPendingReturns error:", e);
    return res.status(500).json({ message: "Could not load pending returns" });
  }
}

module.exports = {
  requestReturn,
  approveReturn,
  rejectReturn,
  listPendingReturns,
};
