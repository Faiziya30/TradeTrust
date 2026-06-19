// routes/merchantAdmin.js
const express = require("express");
const router = express.Router();
const requireMerchant = require("../middleware/requireMerchant");
const controller = require("../controllers/merchantAdmin-controller");

// Merchant only endpoints
router.use(requireMerchant);

// set merchant threshold
router.post("/threshold", controller.setThreshold);

// list customers (masked PII) with lastScore and flags
router.get("/customers", controller.listCustomers);

// view single customer risk summary (masked)
router.get("/customers/:customerId", controller.getCustomerSummary);

module.exports = router;
