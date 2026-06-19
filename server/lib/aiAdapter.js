// lib/aiAdapter.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let model = null;
if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // We use Gemini 1.5/2.5 Flash (JSON-friendly)
  model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
}

/**
 * callModel(payload)
 * payload = { ruleScore, features, recentEvents }
 * RETURNS: { score, confidence, reasons[] }
 */
async function callModel(payload) {
  // If no API key or model, fall back to rule score immediately
  if (!model) {
    return {
      score: payload.ruleScore,
      confidence: 0.3,
      reasons: [
        { feature: "fallback", text: "AI disabled", weight: 0 },
      ],
    };
  }

  const prompt = `
You are a neutral and fair credit scoring system.
You will receive structured JSON containing a customer's feature vector,
recent events, and a rule-based baseline score.

You MUST return ONLY a JSON object with the following structure:

{
  "score": number (0-100),
  "confidence": number (0-1),
  "reasons": [
    { "feature": string, "text": string, "weight": number }
  ]
}

Rules:
- Do NOT exceed 100 or go below 0.
- The "reasons" must be factual and based only on provided data.
- If data is insufficient, return score = payload.ruleScore and confidence = 0.3.
- No extra text. No explanation outside JSON.
- Focus on payment behavior, spending, returns, installment behavior, and boosters.

Here is the data:
${JSON.stringify(payload, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    console.log(JSON.parse(text));
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini JSON parse error:", err.message, text);
    // safe fallback to rule score
    return {
      score: payload.ruleScore,
      confidence: 0.3,
      reasons: [
        { feature: "fallback", text: "Model returned invalid JSON", weight: 0 },
      ],
    };
  }
}

module.exports = { callModel };
