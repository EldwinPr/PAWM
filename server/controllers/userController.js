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

// updates user data
const updateUserData = (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    const userEmail = req.query.email;

    if (!username || !currentPassword) {
        return res.status(400).json({ message: 'Username and current password are required' });
    }

    // Fetch the current user from the database
    db.get('SELECT * FROM users WHERE email = ?', [userEmail], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user: ' + err.message });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare current password
        bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords: ' + err.message });
            }

            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // If a new password is provided, hash it
            if (newPassword) {
                bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error hashing new password: ' + err.message });
                    }

                    // Update username and password
                    const sql = `UPDATE users SET username = ?, password = ? WHERE email = ?`;
                    db.run(sql, [username, hashedNewPassword, userEmail], function (err) {
                        if (err) {
                            return res.status(500).json({ message: 'Error updating user: ' + err.message });
                        }

                        res.status(200).json({ message: 'User updated successfully' });
                    });
                });
            } else {
                // Update only the username if no new password is provided
                const sql = `UPDATE users SET username = ? WHERE email = ?`;
                db.run(sql, [username, userEmail], function (err) {
                    if (err) {
                        return res.status(500).json({ message: 'Error updating user: ' + err.message });
                    }

                    res.status(200).json({ message: 'User updated successfully' });
                });
            }
        });
    });
};

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ?';

        console.log(`Running query to find user with email: ${email}`); // Debugging

        db.get(query, [email], (err, row) => {
            if (err) {
                console.error('Error finding user by email:', err.message); // Enhanced error logging
                reject('Error finding user by email: ' + err.message);
            } else if (!row) {
                console.warn('No user found for email:', email); // Log when no user is found
                reject('User not found');
            } else {
                console.log('User found:', row); // Log found user details
                resolve(row);
            }
        });
    });
};

// Define the getUserData function
const getUserData = async (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT users.*, 
                   user_progress.Drag, 
                   user_progress.Fill, 
                   user_progress.Mult,
                   user_progress.score
            FROM users 
            LEFT JOIN user_progress ON users.email = user_progress.user_email
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching users: ' + err.message });
            }

            // Format the data
            const users = rows.map(row => ({
                username: row.username,
                email: row.email,
                role: row.role || 'user', // Add role
                progress: {
                    Drag: row.Drag === 1,
                    Fill: row.Fill === 1,
                    Mult: row.Mult === 1,
                    score: row.score
                }
            }));

            res.status(200).json(users);
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add role check middleware
const checkAdminRole = async (req, res, next) => {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const sql = 'SELECT admin FROM users WHERE email = ?';
        
        db.get(sql, [userEmail], (err, user) => {
            if (err || !user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.admin) {
                return res.status(403).json({ message: 'Admin access required' });
            }

            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ message: 'Email and role are required' });
    }

    // Only allow 'admin' or 'user' roles
    if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const sql = `UPDATE users SET role = ? WHERE email = ?`;
        
        db.run(sql, [role, email], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error updating role: ' + err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'Role updated successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // First delete from user_progress
        const deleteProgressSql = 'DELETE FROM user_progress WHERE user_email = ?';
        await new Promise((resolve, reject) => {
            db.run(deleteProgressSql, [email], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Then delete from users
        const deleteUserSql = 'DELETE FROM users WHERE email = ?';
        await new Promise((resolve, reject) => {
            db.run(deleteUserSql, [email], function(err) {
                if (err) reject(err);
                if (this.changes === 0) reject(new Error('User not found'));
                resolve();
            });
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user: ' + error.message });
    }
};

// Export the new functions along with existing ones
module.exports = {
    registerUser,
    loginUser,
    getUserData,
    updateUserData,
    checkAdminRole,
    updateUserRole,
    getAllUsers,
    deleteUser
};