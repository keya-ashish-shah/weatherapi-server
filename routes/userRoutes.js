const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");

router.post("/register", validateRegister, userController.register);
router.post("/login", validateLogin, userController.login);

module.exports = router;

