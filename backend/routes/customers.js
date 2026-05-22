const express = require('express');
const router = express.Router();
const db = require('../db');

// Get unique customers from orders
router.get('/', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT DISTINCT customer_name, customer_phone, customer_birthday 
      FROM orders 
      WHERE customer_name IS NOT NULL OR customer_phone IS NOT NULL
      ORDER BY customer_name ASC
    `).all();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customers with birthday today
router.get('/birthdays', (req, res) => {
  try {
    // SQLite query to match month and day
    const today = new Date().toISOString().slice(5, 10); // MM-DD
    const birthdays = db.prepare(`
      SELECT DISTINCT customer_name, customer_phone, customer_birthday
      FROM orders
      WHERE strftime('%m-%d', customer_birthday) = ?
    `).all(today);
    res.json(birthdays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch birthdays' });
  }
});

module.exports = router;
