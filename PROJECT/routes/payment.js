const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create a new payment
router.post('/', paymentController.createPayment);

// Get all payments for a user
router.get('/user/:user_id', paymentController.getPaymentsByUserId);

// Get payment by ID
router.get('/:payment_id', paymentController.getPaymentById);

// Update payment method
router.put('/:payment_id/method', paymentController.updatePaymentMethod);

// Delete a payment
router.delete('/:payment_id', paymentController.deletePayment);

module.exports = router;
