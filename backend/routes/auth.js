const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register (Admin only or first time)
router.post('/register', async (req, res) => {
  const { username, password, role, full_name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)');
    const info = stmt.run(username, hashedPassword, role, full_name);
    res.status(201).json({ id: info.lastInsertRowid, username, role });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists or invalid data' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Password
router.put('/change-password', async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    const info = stmt.run(hashedPassword, userId);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Change PIN
router.put('/change-pin', async (req, res) => {
  const { userId, newPin } = req.body;
  try {
    const stmt = db.prepare('UPDATE users SET pin_code = ? WHERE id = ?');
    stmt.run(newPin, userId);
    res.json({ message: 'PIN updated successfully' });
  } catch (error) {

    console.error('Change PIN Error:', error);
    res.status(500).json({ error: 'Failed to update PIN' });
  }
});


// Verify PIN
router.post('/verify-pin', async (req, res) => {
  const { userId, pin } = req.body;
  try {
    const user = db.prepare('SELECT pin_code FROM users WHERE id = ?').get(userId);
    if (user && user.pin_code === pin) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'كود الحماية غير صحيح' });
    }
  } catch (error) {
    res.status(500).json({ error: 'فشل في التحقق من الكود' });
  }
});

module.exports = router;
