const express = require('express');
const router = express.Router();
const account = require('../controllers/userController');

// Routes for signup and login
router.post('/signup', account.signup);
router.post('/login', account.login);
router.post('/',account.getuserbyemail);
router.post('/notification',account.getNotificationsByUserId);
router.get('/all',account.getAllUsers);
module.exports = router;
