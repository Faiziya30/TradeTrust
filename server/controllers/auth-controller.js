const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Score = require("../models/Score");
const { calculateScore } = require("../lib/scoringEngine");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const TOKEN_EXPIRES = "7d";

// signup
const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    let existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already used" });

    const user = new User({ name, email, role: role || "customer" });
    await user.setPassword(password);
    await user.save();

    // if customer, create linked Customer profile and initial Score
    let customerProfile = null;
    if (user.role === "customer") {
      customerProfile = await Customer.create({ name, email });

      // Calculate initial score (should be ~50 for new customer with no orders)
      const scoreResult = calculateScore(customerProfile.toObject(), []);
      console.log(
        `[SIGNUP] customerId=${
          customerProfile._id
        }, calculated scoreResult=${JSON.stringify(scoreResult)}`
      );

      await Score.create({
        customerId: customerProfile._id,
        score: scoreResult.score,
        level: scoreResult.level,
        eventType: "signup",
        reasons: ["New customer account created"],
        reasonsRule: [
          {
            feature: "new_account",
            text: "New customer account created",
            value: scoreResult.score,
            weight: 0,
          },
        ],
      });
      console.log(
        `[SIGNUP] Score doc created for ${customerProfile._id}: score=${scoreResult.score}, level=${scoreResult.level}`
      );
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, customerId: customerProfile?._id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );
    res.json({
      token,
      user: { _id: user._id, email: user.email, role: user.role },
      customerId: customerProfile?._id,
    });
  } catch (err) {
    console.error("Signup error:", err);
    // Handle duplicate email error from MongoDB
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Handle validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
};

// login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // try find customer profile
    const customer = await Customer.findOne({ email });

    const token = jwt.sign(
      { userId: user._id, role: user.role, customerId: customer?._id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );
    res.json({
      token,
      user: { _id: user._id, email: user.email, role: user.role },
      customerId: customer?._id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

module.exports = { signUp, login };
