const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Representatives ---

// Get all representatives
router.get('/', (req, res) => {
  try {
    const reps = db.prepare('SELECT * FROM representatives ORDER BY name ASC').all();
    res.json(reps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch representatives' });
  }
});

// Create representative
router.post('/', (req, res) => {
  const { name, phone } = req.body;
  try {
    const info = db.prepare('INSERT INTO representatives (name, phone) VALUES (?, ?)').run(name, phone);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Representative created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create representative' });
  }
});

// Delete representative and all their bills
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const transaction = db.transaction(() => {
    const bills = db.prepare('SELECT id FROM representative_bills WHERE representative_id = ?').all(id);
    const deleteItemsStmt = db.prepare('DELETE FROM representative_bill_items WHERE bill_id = ?');
    for (const bill of bills) {
      deleteItemsStmt.run(bill.id);
    }
    db.prepare('DELETE FROM representative_bills WHERE representative_id = ?').run(id);
    db.prepare('DELETE FROM representatives WHERE id = ?').run(id);
  });

  try {
    transaction();
    res.json({ message: 'Representative and all associated bills deleted' });
  } catch (error) {
    console.error('Delete Rep Error:', error);
    res.status(500).json({ error: 'Failed to delete representative', details: error.message });
  }
});

// --- Representative Bills ---

// Get all bills for a representative
router.get('/:id/bills', (req, res) => {
  const { id } = req.params;
  try {
    const bills = db.prepare(`
      SELECT * FROM representative_bills 
      WHERE representative_id = ? 
      ORDER BY created_at DESC
    `).all(id);
    
    const billsWithItems = bills.map(bill => {
      const items = db.prepare(`
        SELECT * 
        FROM representative_bill_items 
        WHERE bill_id = ?
      `).all(bill.id);
      return { ...bill, items };
    });
    
    res.json(billsWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Create a bill for a representative
router.post('/bills', (req, res) => {
  const { representative_id, items, total_amount, notes } = req.body;
  
  const transaction = db.transaction(() => {
    const billStmt = db.prepare(`
      INSERT INTO representative_bills (representative_id, total_amount, status, notes) 
      VALUES (?, ?, 'pending', ?)
    `);
    const billInfo = billStmt.run(representative_id, total_amount, notes || null);
    const billId = billInfo.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO representative_bill_items (bill_id, product_name, quantity, price) 
      VALUES (?, ?, ?, ?)
    `);

    for (const item of items) {
      itemStmt.run(billId, item.product_name, item.quantity, item.price);
    }

    return billId;
  });

  try {
    const billId = transaction();
    res.status(201).json({ id: billId, message: 'Bill created successfully' });
  } catch (error) {
    console.error('Bill Error:', error);
    res.status(500).json({ error: 'Failed to create bill', details: error.message });
  }
});

// Update bill status (e.g., mark as paid)
router.put('/bills/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    db.prepare('UPDATE representative_bills SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: 'Bill status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bill status' });
  }
});

// Update entire bill (edit)
router.put('/bills/:id', (req, res) => {
  const { id } = req.params;
  const { items, total_amount, notes } = req.body;
  
  const transaction = db.transaction(() => {
    // Update bill record
    db.prepare(`
      UPDATE representative_bills 
      SET total_amount = ?, notes = ? 
      WHERE id = ?
    `).run(total_amount, notes || null, id);
    
    // Delete old items
    db.prepare('DELETE FROM representative_bill_items WHERE bill_id = ?').run(id);
    
    // Insert new items
    const itemStmt = db.prepare(`
      INSERT INTO representative_bill_items (bill_id, product_name, quantity, price) 
      VALUES (?, ?, ?, ?)
    `);
    for (const item of items) {
      itemStmt.run(id, item.product_name, item.quantity, item.price);
    }
  });

  try {
    transaction();
    res.json({ message: 'Bill updated successfully' });
  } catch (error) {
    console.error('Update Bill Error:', error);
    res.status(500).json({ error: 'Failed to update bill', details: error.message });
  }
});

// Delete bill
router.delete('/bills/:id', (req, res) => {
  const { id } = req.params;
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM representative_bill_items WHERE bill_id = ?').run(id);
    db.prepare('DELETE FROM representative_bills WHERE id = ?').run(id);
  });

  try {
    transaction();
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Delete Bill Error:', error);
    res.status(500).json({ error: 'Failed to delete bill', details: error.message });
  }
});

module.exports = router;
