const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");

const {
  getDashboard,
  getCustomers,
  getCustomerDetail,
  performAction,
  getSuspiciousActivity,
  notifyCustomer,
} = require("../controllers/merchant-controller");

// All merchant routes - auth check for production
// For now, allowing all authenticated users to test
router.get("/:merchantId/dashboard", getDashboard);

router.get("/:merchantId/customers", getCustomers);

router.get(
  "/:merchantId/customers/:customerId/detail",
  auth(),
  getCustomerDetail
);

router.post("/:merchantId/customers/:customerId/action", auth(), performAction);

router.get("/:merchantId/suspicious", auth(), getSuspiciousActivity);
router.post("/:merchantId/customers/:customerId/notify", auth(), notifyCustomer);

// Debug endpoint: check all orders
router.get("/:merchantId/debug/all-orders", async (req, res) => {
  try {
    const Order = require("../models/Order");
    const orders = await Order.find({}).limit(5).lean();
    console.log("Sample orders:", orders);
    res.json({
      totalOrders: await Order.countDocuments(),
      sampleOrders: orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
