const bcrypt = require('bcryptjs');
const db = require('./db');

/**
 * FOMO Database Seeder
 * This script initializes the database with default categories, products, and an admin user.
 */

async function seed() {
  console.log('🚀 Starting Database Seeding...');

  try {
    // Clear existing data in correct order (dependency order)
    console.log('🧹 Cleaning up old data...');
    db.exec('DELETE FROM order_items');
    db.exec('DELETE FROM orders');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM users');
    
    // Reset autoincrement sequences
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('order_items', 'orders', 'products', 'categories', 'users')");
    console.log('✅ Database cleared and reset.');

    // 1. Create default admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.prepare('INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)')
      .run('admin', hashedPassword, 'admin', 'System Administrator');
    console.log('✅ Admin user created (User: admin / Pass: admin123)');

    // 2. Create categories
    console.log('📂 Seeding categories...');
    const categories = ['فطائر', 'سندوتشات', 'FOMO', 'عروض', 'اضافات'];
    const catStmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    categories.forEach(cat => catStmt.run(cat));

    // Get category IDs for product mapping
    const catRows = db.prepare('SELECT id, name FROM categories').all();
    const catMap = {};
    catRows.forEach(row => catMap[row.name] = row.id);
    console.log(`✅ ${categories.length} Categories seeded.`);

    // 3. Create products
    console.log('🍔 Seeding products...');
    const products = [
      // فطائر
      { name: 'بانية (فطائر)', price: 47, category_id: catMap['فطائر'] },
      { name: 'ستريبس (فطائر)', price: 52, category_id: catMap['فطائر'] },
      { name: 'بيض (فطائر)', price: 37, category_id: catMap['فطائر'] },
      { name: 'عادي (فطائر)', price: 35, category_id: catMap['فطائر'] },

      // سندوتشات
      { name: 'بانية عادي', price: 35, category_id: catMap['سندوتشات'] },
      { name: 'بانية سوبر', price: 40, category_id: catMap['سندوتشات'] },
      { name: 'ستريبس عادي', price: 43, category_id: catMap['سندوتشات'] },
      { name: 'ستريبس سوبر', price: 47, category_id: catMap['سندوتشات'] },
      { name: 'بيض عادي', price: 27, category_id: catMap['سندوتشات'] },
      { name: 'بيض سوبر', price: 32, category_id: catMap['سندوتشات'] },
      { name: 'فرايز', price: 25, category_id: catMap['سندوتشات'] },
      { name: 'حلواني', price: 30, category_id: catMap['سندوتشات'] },
      { name: 'رومي', price: 30, category_id: catMap['سندوتشات'] },

      // FOMO
      { name: 'ساندوتش فومو', price: 80, category_id: catMap['FOMO'] },
      { name: 'فومو ستار', price: 55, category_id: catMap['FOMO'] },
      { name: 'فومو ستار 2', price: 50, category_id: catMap['FOMO'] },

      // عروض
      { name: 'عرض لمة فومو', price: 215, category_id: catMap['عروض'] },
      { name: 'عرض 3 المزاج', price: 120, category_id: catMap['عروض'] },
      { name: 'عرض دبل المتعة', price: 90, category_id: catMap['عروض'] },
      { name: 'عرض بات مان', price: 90, category_id: catMap['عروض'] },
      { name: 'عرض سبايدر مان', price: 160, category_id: catMap['عروض'] },
      { name: 'عرض سوبر مان', price: 180, category_id: catMap['عروض'] },

      // اضافات
      { name: 'اضافة صوص', price: 10, category_id: catMap['اضافات'] },
      { name: 'باكت بطاطس', price: 20, category_id: catMap['اضافات'] },
    ];

    const prodStmt = db.prepare('INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)');
    products.forEach(p => prodStmt.run(p.name, p.price, p.category_id));
    console.log(`✅ ${products.length} Products seeded successfully.`);

    console.log('🎉 Seeding process completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed().then(() => {
  process.exit(0);
});

