const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { loginValidator } = require("../validators/auth.validator");
const { authenticate } = require("../middlewares/auth");

router.post("/login", loginValidator, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
