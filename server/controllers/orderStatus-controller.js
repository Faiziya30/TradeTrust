const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { updateScore } = require("../lib/scoringEngine");

const OrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const valid = ["returned", "chargeback", "failed", "paid"];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid order status" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (reason) order.metadata = { ...order.metadata, reason };
    await order.save();

    const customer = await Customer.findById(order.customerId);
    const orders = await Order.find({ customerId: order.customerId });

    // update customer summary
    const summary = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((s, o) => s + (o.amount || 0), 0),
      returnRate:
        orders.filter((o) => o.status === "returned").length /
        Math.max(1, orders.length),
      paymentSuccessRate:
        orders.filter((o) => o.status === "paid").length /
        Math.max(1, orders.length),
      chargebacks: orders.filter((o) => o.status === "chargeback").length,
    };
    await Customer.findByIdAndUpdate(order.customerId, { $set: summary });

    const { scoreDoc, result } = await updateScore(customer, orders, {
      eventType: status,
      orderId,
    });

    res.json({
      success: true,
      order,
      score: result,
      scoreDoc,
    });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ message: "Status update failed" });
  }
};

module.exports = OrderStatus;
