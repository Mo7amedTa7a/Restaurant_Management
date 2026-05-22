const db = require('./backend/db');
const date = '2026-05-16';
const amount_in = 500;
const amount_out = 100;
const notes = 'Test movement';
const items_out = [{ item_name: 'Test Item', amount: 100 }];

const transaction = db.transaction(() => {
  let hassalaId;
  const existing = db.prepare('SELECT id FROM hassala WHERE date = ?').get(date);
  if (existing) {
    hassalaId = existing.id;
    db.prepare('UPDATE hassala SET amount_in = ?, amount_out = ?, notes = ? WHERE date = ?')
      .run(amount_in, amount_out, notes, date);
  } else {
    const info = db.prepare('INSERT INTO hassala (date, amount_in, amount_out, notes) VALUES (?, ?, ?, ?)')
      .run(date, amount_in, amount_out, notes);
    hassalaId = info.lastInsertRowid;
  }
  db.prepare('DELETE FROM hassala_out_items WHERE hassala_id = ?').run(hassalaId);
  const insertItem = db.prepare('INSERT INTO hassala_out_items (hassala_id, item_name, amount) VALUES (?, ?, ?)');
  for (const item of items_out) {
    insertItem.run(hassalaId, item.item_name, item.amount);
  }
});

transaction();
console.log('Record for 2026-05-16 saved.');
process.exit(0);
