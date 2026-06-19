require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectToDB = require("./db");
const { generateChatReply } = require("./lib/chatBot");
const mongoose = require("mongoose");
const logger = require("./middleware/logger");
const { JWT_SECRET } = require("./config/constants");

const app = express();
const allowedOrigins = process.env.CLIENT_URLS?.split(",") ||
  process.env.CLIENT_URL?.split(",") || [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
const corsOptions = {
  origin: allowedOrigins.map((origin) => origin.trim()),
  credentials: true,
};

const customerRoutes = require("./routes/customerRoute");
const authRoutes = require("./routes/authRoute");
const orderRoutes = require("./routes/orderRoute");
const boostRoutes = require("./routes/boostRoute");
const merchantRoutes = require("./routes/merchantRoute");
const orderStatusRoutes = require("./routes/orderStatusRoute");
const installmentRoutes = require("./routes/installmentRoute");
const adminRoute = require("./routes/adminRoute");
const merchantAdmin = require("./routes/merchantAdminRoute");
const scoreRoutes = require("./routes/scoreRoute");
const returnRoutes = require("./routes/returnRoute");

app.use(cors(corsOptions));
app.use(express.json());

// Ensure JWT_SECRET is explicitly provided
if (!JWT_SECRET) {
  logger.error(
    "FATAL: JWT_SECRET is not set. Set process.env.JWT_SECRET before starting the app."
  );
  process.exit(1);
}

const scoringWorker = require("./lib/scoringWorker");
const reminderScheduler = require("./lib/reminderScheduler");

app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", returnRoutes);
// console.log("Resolved return routes:");
returnRoutes.stack.forEach((l) => {
  if (l.route) {
    logger.debug({ method: Object.keys(l.route.methods)[0], path: l.route.path }, "Resolved return route");
  }
});

app.use("/api/orders", orderRoutes);
app.use("/api/boosts", boostRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/order-status", orderStatusRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/admin", adminRoute);
// Mount merchant admin behind authentication so requireMerchant receives req.user
const auth = require("./middleware/auth-middleware");
app.use("/api/merchant", auth(), merchantAdmin);
app.use("/api/score", scoreRoutes);

// Developer-only helper routes
if (process.env.NODE_ENV === "development") {
  app.post("/dev/reset-db", async (req, res) => {
    try {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const keep = ["users", "customers"];

      for (const col of collections) {
        if (!keep.includes(col.name)) {
          await mongoose.connection.dropCollection(col.name).catch(() => {});
        }
      }

      res.send("DB reset except users & customers");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Lightweight seed endpoint for local development: creates a test user + customer
  app.post("/seed", async (req, res) => {
    try {
      const User = require("./models/User");
      const Customer = require("./models/Customer");
      const email = req.body?.email || `dev+${Date.now()}@example.com`;
      const name = req.body?.name || "Dev Customer";
      const password = req.body?.password || "password123";

      let existing = await User.findOne({ email });
      if (existing) return res.json({ message: "User exists", user: existing });

      const user = new User({ name, email, role: "customer" });
      await user.setPassword(password);
      await user.save();

      const customer = await Customer.create({ name, email });

      return res.json({ user: { _id: user._id, email: user.email }, customer });
    } catch (err) {
      logger.error({ err }, "/seed error");
      res.status(500).json({ message: err.message });
    }
  });
}

// console.log("Loaded return routes:");
// console.log(require("./routes/returnRoute"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, `Socket connected`);

  socket.on("chat:message", async (payload = {}) => {
    const prompt = payload.prompt || "";
    const requestedCustomerId =
      socket.user.role === "customer"
        ? socket.user.customerId
        : payload.customerId;

    if (!requestedCustomerId) {
      socket.emit("chat:error", {
        message:
          "Please choose a customer profile before asking about credit history.",
      });
      return;
    }

    try {
      const reply = await generateChatReply(requestedCustomerId, prompt);
      socket.emit("chat:reply", {
        ...reply,
        customerId: requestedCustomerId,
        ts: Date.now(),
      });
    } catch (err) {
      logger.error({ err }, "chat:message error");
      socket.emit("chat:error", {
        message: "I couldn't retrieve your data. Try again shortly.",
      });
    }
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, `Socket disconnected`);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectToDB();

  try {
    scoringWorker.start();
  } catch (e) {
    logger.warn({ err: e }, "scoringWorker failed to start");
  }
  try {
    reminderScheduler.start && reminderScheduler.start(1000 * 60 * 10);
  } catch (e) {
    logger.warn({ err: e }, "reminderScheduler failed to start");
  }

  server.listen(PORT, () => {
    logger.info({ port: PORT }, `🚀 Server running`);
  });
};

startServer().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
