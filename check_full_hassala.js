const db = require('./backend/db');
console.log('--- Hassala Table ---');
const hassala = db.prepare('SELECT * FROM hassala').all();
console.log(JSON.stringify(hassala, null, 2));
console.log('\n--- Hassala Out Items Table ---');
const items = db.prepare('SELECT * FROM hassala_out_items').all();
console.log(JSON.stringify(items, null, 2));
process.exit(0);
