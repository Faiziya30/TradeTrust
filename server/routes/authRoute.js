const express = require("express");
const { login, signUp } = require("../controllers/auth-controller");
const { validate } = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../validators/authValidators");
const router = express.Router();

router.post("/signup", validate(signupSchema), signUp);
router.post("/login", validate(loginSchema), login);

module.exports = router;
