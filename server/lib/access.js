const sameId = (a, b) => {
  if (!a || !b) return false;
  return String(a) === String(b);
};

function canAccessCustomer(user = {}, targetCustomerId) {
  if (!user || !targetCustomerId) return false;
  if (user.role === "customer") {
    return sameId(user.customerId, targetCustomerId);
  }
  // merchants and future admin roles can inspect any customer document
  return true;
}

function requireCustomerAccess(req, res, targetCustomerId) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  if (!canAccessCustomer(req.user, targetCustomerId)) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
}

module.exports = { canAccessCustomer, requireCustomerAccess };

