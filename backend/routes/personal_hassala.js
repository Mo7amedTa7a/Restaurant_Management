const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all records
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM personal_hassala ORDER BY date DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get record for a specific date
router.get('/today', (req, res) => {
  try {
    const targetDate = req.query.date;
    if (!targetDate) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const row = db.prepare('SELECT * FROM personal_hassala WHERE date = ?').get(targetDate);
    if (row) {
      res.json(row);
    } else {
      res.json({ date: targetDate, amount: 0, notes: '' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total balance (all time)
router.get('/balance', (req, res) => {
  try {
    const result = db.prepare('SELECT SUM(amount) as total FROM personal_hassala').get();
    const balance = (result.total || 0);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get summary grouped by month
router.get('/summary', (req, res) => {
  try {
    // Group by YYYY-MM
    const rows = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total
      FROM personal_hassala
      GROUP BY month
      ORDER BY month DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a record
router.post('/', (req, res) => {
  const { date, amount, notes } = req.body;

  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const safe_amount = amount || 0;
    const safe_notes = notes || '';

    const existing = db.prepare('SELECT id FROM personal_hassala WHERE date = ?').get(date);

    if (existing) {
      db.prepare('UPDATE personal_hassala SET amount = ?, notes = ? WHERE date = ?')
        .run(safe_amount, safe_notes, date);
    } else {
      db.prepare('INSERT INTO personal_hassala (date, amount, notes) VALUES (?, ?, ?)')
        .run(date, safe_amount, safe_notes);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Personal Hassala POST Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a record
router.delete('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    db.prepare('DELETE FROM personal_hassala WHERE date = ?').run(date);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
