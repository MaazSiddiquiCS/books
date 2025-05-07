const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin registration
router.post('/register', adminController.registerAdmin);

// Admin login
router.post('/login', adminController.loginAdmin);

// Get admin by ID
router.get('/:id', adminController.getAdminById);

// Update admin
router.put('/:id', adminController.updateAdmin);

module.exports = router;