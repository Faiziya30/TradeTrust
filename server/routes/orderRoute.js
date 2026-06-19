const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const handleOrder = require("../controllers/order-controller");

router.post("/", auth("customer"), handleOrder);

module.exports = router;
