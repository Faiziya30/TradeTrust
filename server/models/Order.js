// models/Order.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ItemSchema = new Schema({
  productId: String,
  name: String,
  price: Number,
  qty: Number,
});

const OrderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    merchantId: { type: String, default: "demo-store" },
    items: { type: [ItemSchema], default: [] },
    amount: { type: Number, required: true },
    paymentOption: {
      type: String,
      enum: ["pay_now", "installment", "pay_later"],
      default: "pay_now",
    },
    // statuses normalized for installments & pay-later
    status: {
      type: String,
      enum: [
        "paid",
        "pending",
        "installment_pending",
        "installment_partial",
        "installment_completed",
        "pay_later_pending",
        "pay_later_completed",
        "returned",
        "failed",
        "chargeback",
      ],
      default: "pending",
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none",
    },
    returnReason: { type: String, default: "" },
    returnRequestedAt: Date,
    returnApprovedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
