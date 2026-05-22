const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all products
router.get('/', (req, res) => {
  const products = db.prepare(`
    SELECT products.*, categories.name as category_name 
    FROM products 
    LEFT JOIN categories ON products.category_id = categories.id
  `).all();
  res.json(products);
});

// Add product
router.post('/', (req, res) => {
  const { name, price, category_id } = req.body;
  const stmt = db.prepare('INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)');
  const info = stmt.run(name, price, category_id);
  res.status(201).json({ id: info.lastInsertRowid, name, price });
});

// Update product
router.put('/:id', (req, res) => {
  const { name, price, category_id } = req.body;
  const { id } = req.params;
  try {
    const stmt = db.prepare('UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?');
    stmt.run(name, price, category_id, id);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
