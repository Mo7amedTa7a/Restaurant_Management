const db = require('./db');

const updates = [
  { name: 'عرض لمة فومو', price: 215 },
  { name: 'عرض 3 المزاج', price: 120 },
  { name: 'عرض دبل المتعة', price: 90 }
];

console.log('Updating offers...');

for (const update of updates) {
  const result = db.prepare('UPDATE products SET price = ? WHERE name = ?')
    .run(update.price, update.name);
  
  if (result.changes > 0) {
    console.log(`✅ Updated ${update.name} to ${update.price} EGP`);
  } else {
    console.log(`❌ Could not find offer: ${update.name}`);
  }
}

console.log('Update complete.');
process.exit(0);
