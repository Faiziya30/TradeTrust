const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const handleOrder = require("../controllers/order-controller");
const { validate } = require("../middleware/validate");
const { createOrderSchema } = require("../validators/orderValidators");

router.post("/", auth("customer"), validate(createOrderSchema), handleOrder);

module.exports = router;
