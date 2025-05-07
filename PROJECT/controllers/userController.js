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
exports.getuserbyemail = (req, res) => {
  const { email } = req.body; // Destructure the 'email' field from the request body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' }); // Handle missing email error
  }

  db.query('SELECT user_id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error fetching user by email:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' }); // Handle case where no user is found
    }

    res.json(results); // Send the results back
  });
};
exports.getNotificationsByUserId = (req, res) => {
  const { user_id } = req.body; 

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' }); // Handle missing user_id error
  }
  db.query('SELECT * FROM notifications WHERE user_id = ? order by notification_id desc', [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching notifications by user_id:', err.message);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No notifications found for this user' }); // Handle case where no notifications are found
    }
    res.json(results); // Send the results back (notifications)
  });
};
exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM authors', (err, results) => {
      if (err) {
          console.error('Error fetching authors:', err.message);
          return res.status(500).json({ error: 'Failed to fetch authors' });
      }
      res.json(results);
  });
};
