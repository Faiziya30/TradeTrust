const mongoose = require("mongoose");

const SuspiciousActivitySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  type: {
    type: String,
    enum: ["rapid_repayment"], // can be extended
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ["detected", "notified", "resolved"],
    default: "detected",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SuspiciousActivity", SuspiciousActivitySchema);
