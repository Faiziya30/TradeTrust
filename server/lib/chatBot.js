const {
  collectCustomerInsights,
  buildRecommendations,
} = require("./customerInsights");

function includesAny(prompt = "", keywords = []) {
  const lower = prompt.toLowerCase();
  return keywords.some((word) => lower.includes(word));
}

function formatReasons(reasons = []) {
  if (!reasons.length) return null;
  return reasons
    .slice(0, 3)
    .map((reason) =>
      reason.value ? `${reason.text} (${reason.value})` : reason.text
    )
    .join("; ");
}

async function generateChatReply(customerId, prompt = "") {
  const insights = await collectCustomerInsights(customerId);
  if (!insights) {
    return {
      text: "I could not find that customer profile yet. Try refreshing the page or placing an order first.",
      status: "missing_profile",
    };
  }

  const { customer, latestScore, trend, reasons, orderStats, recommendations, sanitizedOrders } = insights;
  const displayName = customer.name || "valued customer";

  // Check for API Key
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Format Orders for Context
        const recentOrdersCtx = sanitizedOrders && sanitizedOrders.length 
            ? sanitizedOrders.slice(0, 3).map(o => 
                `- Order #${String(o.id).slice(-6).toUpperCase()}: ₹${o.amount} (${o.status}) on ${new Date(o.createdAt).toLocaleDateString()}`
              ).join("\n")
            : "No recent orders.";

        const scoreTrendCtx = trend !== null 
            ? (trend > 0 ? "+" + trend : trend) + " points" 
            : "No change";

        const context = `
            You are "Score Copilot", a helpful and friendly credit analyst assistant for the "TrustCart" platform.
            You are talking to ${displayName}.
            
            Here is the customer's live data:
            - Current Score: ${latestScore?.score ?? "N/A"} / 100 (${latestScore?.level ?? "Unknown"})
            - Score Trend: ${scoreTrendCtx} since last event.
            - Total Orders: ${orderStats.totalOrders}
            - Total Spent: ₹${orderStats.totalSpent}
            - Payment Success Rate: ${Math.round(orderStats.paymentSuccessRate * 100)}%
            - Return Rate: ${Math.round(orderStats.returnRate * 100)}%
            - Recent Orders (Last 3):
            ${recentOrdersCtx}
            - Top Score Factors: ${reasons.map(r => r.text).join(", ") || "None yet"}
            - Recommended Actions: ${recommendations.join(", ") || "Keep up the good work!"}

            Your Goal: Answer the user's question explicitly based on this data. Be concise, encouraging, and professional.
            If they ask about their last order, use the Recent Orders data.
            If the user says "Hello" or "Hi", welcome them warmly and mention their score.
            
            User's Question: "${prompt}"
        `;

        const result = await model.generateContent(context);
        const responseText = result.response.text();
        
        return {
            text: responseText,
            status: "ok",
            score: latestScore,
            trend,
            reasons,
            recommendations: recommendations.slice(0, 3),
        }

      } catch (err) {
          console.error("Gemini Chatbot Error:", err.message);
          // Fallback to keyword matching below
      }
  }

  // FALLBACK LOGIC (Original keyword matching)
  const reply = [];
  let intentMatched = false;

  const wantsSnapshot = includesAny(prompt, [
    "snapshot", "overview", "score", "current score", "my score",
  ]);
  const wantsReasons = includesAny(prompt, [
    "why", "reason", "history", "factors", "changed",
  ]);
  const wantsImprove = includesAny(prompt, [
    "improve", "boost", "raise", "tips", "better",
  ]);
  const wantsOrders = includesAny(prompt, [
    "order", "transaction", "spend", "purchases",
  ]);
  const wantsHello = includesAny(prompt, ["hello", "hi", "hey"]);

  // Handle initial empty prompt or explicit snapshot request
  if (prompt.trim() === "" || wantsSnapshot) {
    if (latestScore) {
      reply.push(
        `Hi ${displayName}, your current TrustCart score is ${latestScore.score} (${latestScore.level}).`
      );
      if (trend === 0) {
        reply.push("It has not changed since the previous update.");
      } else if (trend > 0) {
        reply.push(`That's +${trend} since the last event – nice progress!`);
      } else if (trend < 0) {
        reply.push(
          `It dipped by ${Math.abs(
            trend
          )} points compared to the previous check.`
        );
      }
      const formattedReasons = formatReasons(reasons);
      if (formattedReasons) {
        reply.push(`Top factors: ${formattedReasons}.`);
      }
    } else {
      reply.push(
        `Hi ${displayName}, I don't have enough signals to build a score yet. Complete a purchase to generate one.`
      );
    }
    intentMatched = true;
  }

  // Handle specific intents
  if (wantsHello && prompt.toLowerCase().trim() === "hello") {
    reply.push("How can I help you today?");
    intentMatched = true;
  } else if (wantsReasons && !wantsSnapshot) {
    // Only if not already covered by snapshot
    const formattedReasons = formatReasons(reasons);
    if (formattedReasons) {
      reply.push(
        `The main factors affecting your score are: ${formattedReasons}.`
      );
    } else {
      reply.push("I'll show factors as soon as we have more activity.");
    }
    intentMatched = true;
  } else if (wantsOrders) {
    reply.push(
      `You have ${orderStats.totalOrders} orders totaling ₹${orderStats.totalSpent}.`
    );
    reply.push(
      `Payment success currently sits at ${Math.round(
        orderStats.paymentSuccessRate * 100
      )}% and returns at ${Math.round(orderStats.returnRate * 100)}%.`
    );
    intentMatched = true;
  } else if (wantsImprove) {
    const tips = buildRecommendations(customer, { orderStats });
    if (tips.length) {
      reply.push(`To improve your score: ${tips.slice(0, 2).join(" ")}.`);
    } else {
      reply.push("You're doing great! Keep up the good work.");
    }
    intentMatched = true;
  }

  // Default response if no specific intent was matched and there was a prompt
  if (!intentMatched && prompt.trim() !== "") {
    reply.push(
      "I'm not sure I understand. You can ask me about your score, orders, or how to improve your score."
    );
  }

  return {
    text: reply.join(" "),
    status: "ok",
    score: latestScore,
    trend,
    reasons,
    recommendations: buildRecommendations(customer, { orderStats }).slice(0, 3),
  };
}

module.exports = { generateChatReply };
