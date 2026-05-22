const db = require('./backend/db');
const rows = db.prepare('SELECT * FROM hassala').all();
console.log(JSON.stringify(rows, null, 2));
const balance = db.prepare('SELECT SUM(amount_in) as total_in, SUM(amount_out) as total_out FROM hassala').get();
console.log('Balance:', balance);
process.exit(0);
