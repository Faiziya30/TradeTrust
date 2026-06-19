const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: ["score", "order", "payment", "booster", "system"],
    default: "system",
  },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  metadata: mongoose.Schema.Types.Mixed,
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);

