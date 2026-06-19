const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  score: { type: Number, required: true },
  level: { type: String },
  reasons: { type: [String], default: [] }, // human-friendly strings
  reasonsRule: { type: Array, default: [] }, // structured rule reasons
  reasonsAI: { type: Array, default: [] }, // structured AI reasons
  aiRequest: { type: Schema.Types.Mixed, default: null },
  aiResponse: { type: Schema.Types.Mixed, default: null },
  blend: { type: Object, default: null }, // { ruleWeight, aiWeight }
  eventType: String,
  meta: Schema.Types.Mixed,
  modelVersion: { type: String, default: "rule-v2" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Score", ScoreSchema);
