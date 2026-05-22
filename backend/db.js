const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'restaurant.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'cashier')) NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    customer_birthday DATE,
    total_amount REAL NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    bread_type TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS representatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS representative_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    representative_id INTEGER,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'paid')) DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (representative_id) REFERENCES representatives(id)
  );

  CREATE TABLE IF NOT EXISTS representative_bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER,
    product_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES representative_bills(id)
  );

  CREATE TABLE IF NOT EXISTS hassala (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    amount_in REAL DEFAULT 0,
    amount_out REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hassala_out_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hassala_id INTEGER,
    item_name TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (hassala_id) REFERENCES hassala(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS personal_hassala (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    amount REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Helper to get local date in YYYY-MM-DD format
const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initialize settings if they don't exist
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('current_working_shift', ?)").run(getLocalDateString());
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('working_shift_status', 'active')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('working_shift_start_time', ?)").run(new Date().toISOString());
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('working_shift_end_time', NULL)").run();

// Migration: Add working_shift column to orders table if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasWorkingShift = tableInfo.some(column => column.name === 'working_shift');
  if (!hasWorkingShift) {
    db.prepare("ALTER TABLE orders ADD COLUMN working_shift TEXT").run();
    console.log("Migration: Added working_shift column to orders table successfully.");
  }
} catch (err) {
  console.error("Migration error (adding working_shift to orders):", err);
}

module.exports = db;
