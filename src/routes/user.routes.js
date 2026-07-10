const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { createUserValidator } = require("../validators/user.validator");
const { authenticate } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/rbac");

// router.use(authenticate);

router.get("/", 
    // requireRole("admin"),
 userController.listUsers);
router.post(
  "/",
//   requireRole("admin"),
  createUserValidator,
  userController.createUser,
);

module.exports = router;
