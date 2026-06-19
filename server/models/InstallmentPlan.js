// models/InstallmentPlan.js
const mongoose = require("mongoose");

const InstallmentSchema = new mongoose.Schema({
  index: Number,
  dueDate: Date,
  amount: Number,
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  paidAt: Date,
  late: Boolean,
});

const InstallmentPlanSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // MAIN FIX:
    // Only two types exist: installment (4-part) and pay_later (one payment)
    type: {
      type: String,
      enum: ["installment", "pay_later"],
      required: true,
    },

    // For installment plans
    schedule: [InstallmentSchema],

    // For pay_later
    dueDate: Date,

    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "active", "partial", "completed", "paid"],
      default: "pending",
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstallmentPlan", InstallmentPlanSchema);
