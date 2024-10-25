// Import dependencies
const db = require('../models/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username, and password are required' });
    }

    // Hash the password before saving
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password: ' + err.message });
        }

        const sql = `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`;
        db.run(sql, [email, username, hashedPassword], function (err) {
            if (err) {
                return res.status(400).json({ message: 'Error creating user: ' + err.message });
            }
            res.status(201).json({ message: 'User registered successfully', userEmail: email });
        });
    });
};

// Login User
const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user: ' + err.message });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords: ' + err.message });
            }

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign({ email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        });
    });
};

module.exports = {
    registerUser,
    loginUser,
};
