const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Route to create new employees
router.post("/signup", authController.createEmployee);

module.exports = router;