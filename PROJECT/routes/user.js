const express = require('express');
const router = express.Router();
const account = require('../controllers/userController');

// Routes for signup and login
router.post('/signup', account.signup);
router.post('/login', account.login);

module.exports = router;
