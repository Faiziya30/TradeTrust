const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const OrderStatus = require("../controllers/orderStatus-controller");

router.post("/:orderId/status", auth("merchant"), OrderStatus);

module.exports = router;
