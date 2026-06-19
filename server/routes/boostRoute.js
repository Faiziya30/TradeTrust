const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const boostScore = require("../controllers/boost-controller");

router.post("/:booster", auth("customer"), boostScore);

module.exports = router;
