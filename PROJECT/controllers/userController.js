const db = require('../db/connection');

// Signup function
exports.signup = (req, res) => {
  const { username, email, password } = req.body;

  // First, check if the email already exists in the database
  db.execute('SELECT * FROM users WHERE email = ?', [email], (error, rows) => {
    if (error) {
      console.error('Error during query:', error);
      return res.status(500).json({ error: 'Error creating user', details: error.message });
    }

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Now, insert the new user into the database
    db.execute(
      `INSERT INTO users (username, email, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, 'viewer', SYSDATE(), SYSDATE())`,
      [username, email, password],
      (insertError, insertResult) => {
        if (insertError) {
          console.error('Error inserting user:', insertError);
          return res.status(500).json({ error: 'Error creating user', details: insertError.message });
        }

        res.status(201).json({ message: 'User created successfully' });
      }
    );
  });
};

// Login function
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Query to fetch the user by email using the callback approach
  db.execute('SELECT * FROM users WHERE email = ?', [email], (error, rows) => {
      if (error) {
          console.error('Error during query:', error);
          return res.status(500).json({ error: 'Error logging in', details: error.message });
      }

      // If no user is found, return an error
      if (rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      const user = rows[0];

      // Check if the password matches
      if (password !== user.password) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Respond with user details on successful login
      res.status(200).json({
          message: 'Login successful',
          user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
          },
      });
  });
};
