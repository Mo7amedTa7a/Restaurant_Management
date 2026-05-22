const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all categories
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

// Add category
router.post('/', (req, res) => {
  const { name, image } = req.body;
  const stmt = db.prepare('INSERT INTO categories (name, image) VALUES (?, ?)');
  const info = stmt.run(name, image);
  res.status(201).json({ id: info.lastInsertRowid, name, image });
});

module.exports = router;
