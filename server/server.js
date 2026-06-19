require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectToDB = require("./db");
const { generateChatReply } = require("./lib/chatBot");
const mongoose = require("mongoose");

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

connectToDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo connection failed:", err));

const scoringWorker = require("./lib/scoringWorker");
const reminderScheduler = require("./lib/reminderScheduler");

try {
  scoringWorker.start();
} catch (e) {
  console.error("scoringWorker failed to start:", e.message);
}
try {
  reminderScheduler.start && reminderScheduler.start(1000 * 60 * 10);
} catch (e) {
  console.error("reminderScheduler failed to start:", e.message);
}

app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", returnRoutes);
// console.log("Resolved return routes:");
returnRoutes.stack.forEach((l) => {
  if (l.route) {
    console.log("METHOD:", Object.keys(l.route.methods)[0]);
    console.log("PATH:  ", l.route.path);
  }
});

app.use("/api/orders", orderRoutes);
app.use("/api/boosts", boostRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/order-status", orderStatusRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/merchant", merchantAdmin);
app.use("/api/score", scoreRoutes);

app.get("/dev/reset-db", async (req, res) => {
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

// console.log("Loaded return routes:");
// console.log(require("./routes/returnRoute"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

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
  console.log(`Socket connected: ${socket.id}`);

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
      console.error("chat:message error", err);
      socket.emit("chat:error", {
        message: "I couldn't retrieve your data. Try again shortly.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
