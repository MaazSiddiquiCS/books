const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', async (req, res) => {
    try {
        const user = await userController.getuserbyemail(req.body);
        res.json(user);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST new user (signup)
router.post('/signup', async (req, res) => {
    try {
        const newUser = await userController.signup(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// POST login user
router.post('/login', async (req, res) => {
    try {
        const user = await userController.login(req.body);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to log in user' });
    }
});

module.exports = router;