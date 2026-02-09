const express = require("express");
const router = express.Router();

const register = require("../controllers/auth/register");
const login = require("../controllers/auth/login");
const verifyAccount=require("../controllers/auth/verify_account");
const authMiddleware = require("../middleware/auth_middleware");
const forgotPassword = require("../controllers/auth/forgot_password");
const resetPassword = require("../controllers/auth/reset_password")
const deleteAccount = require("../controllers/auth/delete_account");


router.post("/register", register);
router.post("/login", login);
router.post("/verify_account", verifyAccount);
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);

router.delete("/delete_account", deleteAccount);

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
