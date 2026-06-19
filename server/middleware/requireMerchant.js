module.exports = function requireMerchant(req, res, next) {
  if (!req.user || req.user.role !== "merchant") {
    return res.status(403).json({ message: "Merchant only" });
  }
  next();
};
