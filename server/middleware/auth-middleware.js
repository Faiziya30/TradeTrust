// middleware/auth-middleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function auth(requiredRole) {
  return (req, res, next) => {
    const header =
      req.headers.authorization ||
      req.headers["x-access-token"] ||
      req.headers["authorization"];
    if (!header) return res.status(401).json({ message: "Missing token" });

    let token = header;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; // userId, role, customerId
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (err) {
      console.error("auth error:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports = auth;
