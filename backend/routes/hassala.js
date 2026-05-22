const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all hassala records
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM hassala ORDER BY date DESC').all();
    const rowsWithItems = rows.map(row => {
      const items = db.prepare('SELECT * FROM hassala_out_items WHERE hassala_id = ?').all(row.id);
      return { ...row, items_out: items };
    });
    res.json(rowsWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's or specific date record
router.get('/today', (req, res) => {
  try {
    // Default to local date if no date provided
    const getLocalDate = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const targetDate = req.query.date || getLocalDate();
    const row = db.prepare('SELECT * FROM hassala WHERE date = ?').get(targetDate);
    if (row) {
      const items = db.prepare('SELECT * FROM hassala_out_items WHERE hassala_id = ?').all(row.id);
      row.items_out = items;
      res.json(row);
    } else {
      res.json({ date: targetDate, amount_in: 0, amount_out: 0, notes: '', items_out: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total balance
router.get('/balance', (req, res) => {
  try {
    const result = db.prepare('SELECT SUM(amount_in) as total_in FROM hassala').get();
    const balance = (result.total_in || 0);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a record
router.post('/', (req, res) => {
  const { date, amount_in, amount_out, notes, items_out } = req.body;

  const transaction = db.transaction(() => {
    let hassalaId;
    const existing = db.prepare('SELECT id FROM hassala WHERE date = ?').get(date);

    const safe_amount_in = amount_in || 0;
    const safe_amount_out = amount_out || 0;
    const safe_notes = notes || '';

    if (existing) {
      hassalaId = existing.id;
      db.prepare('UPDATE hassala SET amount_in = ?, amount_out = ?, notes = ? WHERE date = ?')
        .run(safe_amount_in, safe_amount_out, safe_notes, date);
    } else {
      const info = db.prepare('INSERT INTO hassala (date, amount_in, amount_out, notes) VALUES (?, ?, ?, ?)')
        .run(date, safe_amount_in, safe_amount_out, safe_notes);
      hassalaId = info.lastInsertRowid;
    }

    // Update items_out
    if (items_out && Array.isArray(items_out)) {
      db.prepare('DELETE FROM hassala_out_items WHERE hassala_id = ?').run(hassalaId);
      const insertItem = db.prepare('INSERT INTO hassala_out_items (hassala_id, item_name, amount) VALUES (?, ?, ?)');
      for (const item of items_out) {
        if (item.item_name && item.amount) {
          insertItem.run(hassalaId, item.item_name, item.amount);
        }
      }
    }
  });

  try {
    transaction();
    res.json({ success: true });
  } catch (err) {
    console.error('Hassala POST Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a record
router.delete('/', (req, res) => {
  const { date } = req.query;
  try {
    db.prepare('DELETE FROM hassala WHERE date = ?').run(date);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
