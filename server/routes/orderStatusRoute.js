const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const OrderStatus = require("../controllers/orderStatus-controller");
const { validate } = require('../middleware/validate');
const { orderStatusSchema } = require('../validators/orderStatusValidators');

router.post("/:orderId/status", auth("merchant"), validate(orderStatusSchema), OrderStatus);

module.exports = router;
