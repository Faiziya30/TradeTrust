const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScoringEventSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, required: true, ref: "Customer" },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  processed: { type: Boolean, default: false },
  processedAt: Date,
  error: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ScoringEvent", ScoringEventSchema);
