const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  deviceId: String,
  createdAt: { type: Date, default: Date.now },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  returnRate: { type: Number, default: 0 },
  paymentSuccessRate: { type: Number, default: 1 },
  chargebacks: { type: Number, default: 0 },
  lastActive: Date,
  kycStatus: {
    type: String,
    enum: ["unverified", "pending", "verified"],
    default: "unverified",
  },
  addressVerified: { type: Boolean, default: false },
  bankLinked: { type: Boolean, default: false },
  boosters: {
    phoneVerified: { type: Boolean, default: false },
    cardLinked: { type: Boolean, default: false },
    verifiedReviews: { type: Number, default: 0 },
    onTimePayments: { type: Number, default: 0 },
  },
  preferredPaymentOption: {
    type: String,
    enum: ["pay_now", "pay_later"],
    default: "pay_now",
  },
  scoreBoost: { type: Number, default: 0 },
  lastScore: { type: Number, default: 50 },
  lastScoreReasons: { type: [String], default: [] },
});

module.exports = mongoose.model("Customer", CustomerSchema);
