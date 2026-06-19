const mongoose = require("mongoose");

const MerchantActionSchema = new mongoose.Schema({
  merchantId: {
    type: String,
    // ref: "User", // ref removed as it can be a hardcoded string
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  action: {
    type: String,
    enum: ["approve", "require_deposit", "hold"],
    required: true,
  },
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MerchantAction", MerchantActionSchema);
