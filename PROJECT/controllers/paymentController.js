const db = require('../db/connection');

// Create a new payment
// In your paymentController.js
exports.createPayment = (req, res) => {
    const { payment_id,user_id, payment_date, method, book_id, amount } = req.body;
  
    // Validate required fields
    if (!user_id || !payment_date || !method || !book_id || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Insert the new payment
    db.execute(
      INSERT INTO payment (payment_id,user_id, payment_date, method, book_id, amount) 
       VALUES (5,?, ?, ?, ?, ?),
      [payment_id,user_id, payment_date, method, book_id, amount],
      (error, results) => {
        if (error) {
          console.error('Error creating payment:', error);
          return res.status(500).json({ error: 'Error creating payment', details: error.message });
        }
  
        res.status(201).json({ 
          message: 'Payment created successfully',
          payment_id: results.insertId 
        });
      }
    );
  };

// Get all payments for a user
exports.getPaymentsByUserId = (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  db.query(
    'SELECT * FROM Payment WHERE user_id = ? ORDER BY payment_date DESC',
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching payments:', err.message);
        return res.status(500).json({ error: 'Failed to fetch payments' });
      }

      res.json(results);
    }
  );
};

// Get payment by ID
exports.getPaymentById = (req, res) => {
  const { payment_id } = req.params;

  if (!payment_id) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  db.query(
    'SELECT * FROM payment WHERE payment_id = ?',
    [payment_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching payment:', err.message);
        return res.status(500).json({ error: 'Failed to fetch payment' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json(results[0]);
    }
  );
};

// Update payment method
exports.updatePaymentMethod = (req, res) => {
  const { payment_id } = req.params;
  const { method } = req.body;

  if (!payment_id || !method) {
    return res.status(400).json({ error: 'Payment ID and method are required' });
  }

  db.execute(
    'UPDATE payment SET method = ? WHERE payment_id = ?',
    [method, payment_id],
    (error, results) => {
      if (error) {
        console.error('Error updating payment:', error);
        return res.status(500).json({ error: 'Error updating payment', details: error.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({ message: 'Payment updated successfully' });
    }
  );
};

// Delete a payment
exports.deletePayment = (req, res) => {
  const { payment_id } = req.params;

  if (!payment_id) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  db.execute(
    'DELETE FROM payment WHERE payment_id = ?',
    [payment_id],
    (error, results) => {
      if (error) {
        console.error('Error deleting payment:', error);
        return res.status(500).json({ error: 'Error deleting payment', details: error.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({ message: 'Payment deleted successfully' });
    }
  );
};
