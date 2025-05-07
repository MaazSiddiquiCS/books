const db = require('../db/connection');

// Admin Registration
exports.registerAdmin = (req, res) => {
  const { id, name, role, logged_in } = req.body;

  // First check if admin ID already exists
  db.execute('SELECT * FROM admin WHERE id = ?', [id], (error, rows) => {
    if (error) {
      console.error('Error during query:', error);
      return res.status(500).json({ error: 'Error checking admin', details: error.message });
    }

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Admin ID already exists' });
    }

    // Insert new admin
    db.execute(
      `INSERT INTO admin (id, name, role, logged_in) 
       VALUES (?, ?, ?, ?)`,
      [id, name, role, logged_in],
      (insertError, insertResult) => {
        if (insertError) {
          console.error('Error inserting admin:', insertError);
          return res.status(500).json({ error: 'Error creating admin', details: insertError.message });
        }

        res.status(201).json({ 
          message: 'Admin created successfully',
          admin: { id, name, role }
        });
      }
    );
  });
};

// Admin Login
exports.loginAdmin = (req, res) => {
  const { id } = req.body;

  db.execute('SELECT * FROM admin WHERE id = ?', [id], (error, rows) => {
    if (error) {
      console.error('Error during query:', error);
      return res.status(500).json({ error: 'Error logging in', details: error.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = rows[0];
    res.status(200).json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        role: admin.role
      }
    });
  });
};

// Get Admin by ID
exports.getAdminById = (req, res) => {
  const { id } = req.params;

  db.execute('SELECT * FROM admin WHERE id = ?', [id], (error, rows) => {
    if (error) {
      console.error('Error fetching admin:', error);
      return res.status(500).json({ error: 'Failed to fetch admin', details: error.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json(rows[0]);
  });
};

// Update Admin
exports.updateAdmin = (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  db.execute(
    'UPDATE admin SET name = ?, role = ? WHERE id = ?',
    [name, role, id],
    (error, result) => {
      if (error) {
        console.error('Error updating admin:', error);
        return res.status(500).json({ error: 'Failed to update admin', details: error.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.status(200).json({ message: 'Admin updated successfully' });
    }
  );
};