const express = require('express');
const router = express.Router();
const { login, signup, auth } = require("../controllers/authController");

router.post('/login', login);
router.post('/signup', signup);
router.get('/me',auth );

module.exports = router;