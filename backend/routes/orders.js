const express = require('express');
const router = express.Router();
const db = require('../db');
const { spawn } = require('child_process');
const path = require('path');


// Get next order ID
router.get('/next-id', (req, res) => {
  try {
    const result = db.prepare("SELECT MAX(id) as maxId FROM orders").get();
    const nextId = (result.maxId || 0) + 1;
    res.json({ nextId });
  } catch (error) {
    console.error('Next ID Error:', error);
    res.status(500).json({ error: 'Failed to get next ID' });
  }
});

// Helper to get local date in YYYY-MM-DD format
const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get current working shift status (Declared above dynamic parameterized /:id routes to prevent collision)
router.get('/working-shift', (req, res) => {
  try {
    const workingShift = db.prepare("SELECT value FROM settings WHERE key = 'current_working_shift'").get()?.value;
    const status = db.prepare("SELECT value FROM settings WHERE key = 'working_shift_status'").get()?.value;
    const startTime = db.prepare("SELECT value FROM settings WHERE key = 'working_shift_start_time'").get()?.value;
    const endTime = db.prepare("SELECT value FROM settings WHERE key = 'working_shift_end_time'").get()?.value;
    res.json({ workingShift, status, startTime, endTime });
  } catch (error) {
    console.error('Failed to get working shift:', error);
    res.status(500).json({ error: 'Failed to get working shift status' });
  }
});

// Start new working shift manually
router.post('/start-shift', (req, res) => {
  try {
    const newStartTime = new Date().toISOString();

    db.prepare("UPDATE settings SET value = 'active' WHERE key = 'working_shift_status'").run();
    db.prepare("UPDATE settings SET value = ? WHERE key = 'current_working_shift'").run(newStartTime);
    db.prepare("UPDATE settings SET value = ? WHERE key = 'working_shift_start_time'").run(newStartTime);
    db.prepare("UPDATE settings SET value = NULL WHERE key = 'working_shift_end_time'").run();

    res.json({
      message: 'New working shift started successfully',
      workingShift: newStartTime,
      status: 'active',
      startTime: newStartTime,
      endTime: null
    });
  } catch (error) {
    console.error('Failed to start new shift:', error);
    res.status(500).json({ error: 'Failed to start new working shift' });
  }
});

// End current working shift manually
router.post('/end-shift', (req, res) => {
  try {
    const currentWorkingShift = db.prepare("SELECT value FROM settings WHERE key = 'current_working_shift'").get()?.value;
    const startTime = db.prepare("SELECT value FROM settings WHERE key = 'working_shift_start_time'").get()?.value;
    const newEndTime = new Date().toISOString();

    db.prepare("UPDATE settings SET value = 'closed' WHERE key = 'working_shift_status'").run();
    db.prepare("UPDATE settings SET value = ? WHERE key = 'working_shift_end_time'").run(newEndTime);

    // Calculate total orders and total sales for this working shift
    const summary = db.prepare("SELECT COUNT(id) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales FROM orders WHERE working_shift = ?").get(currentWorkingShift);

    res.json({
      message: 'Working shift ended successfully',
      workingShift: currentWorkingShift,
      status: 'closed',
      startTime: startTime,
      endTime: newEndTime,
      summary: {
        totalOrders: summary.total_orders,
        totalSales: parseFloat(parseFloat(summary.total_sales).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Failed to end shift:', error);
    res.status(500).json({ error: 'Failed to end working shift' });
  }
});

// Create order
router.post('/', (req, res) => {
  const { user_id, items, total_amount, payment_method, customer_name, customer_phone, customer_birthday } = req.body;

  const transaction = db.transaction(() => {
    // Determine active working shift and status
    let workingShiftStatus = db.prepare("SELECT value FROM settings WHERE key = 'working_shift_status'").get()?.value;
    let currentWorkingShift = db.prepare("SELECT value FROM settings WHERE key = 'current_working_shift'").get()?.value;

    if (workingShiftStatus === 'closed') {
      currentWorkingShift = new Date().toISOString();
      db.prepare("UPDATE settings SET value = 'active' WHERE key = 'working_shift_status'").run();
      db.prepare("UPDATE settings SET value = ? WHERE key = 'current_working_shift'").run(currentWorkingShift);
      db.prepare("UPDATE settings SET value = ? WHERE key = 'working_shift_start_time'").run(currentWorkingShift);
      db.prepare("UPDATE settings SET value = NULL WHERE key = 'working_shift_end_time'").run();
    }

    const orderStmt = db.prepare(`
      INSERT INTO orders (user_id, total_amount, payment_method, customer_name, customer_phone, customer_birthday, working_shift) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const orderInfo = orderStmt.run(user_id, total_amount, payment_method, customer_name, customer_phone, customer_birthday, currentWorkingShift);
    const orderId = orderInfo.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price, bread_type) 
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      itemStmt.run(orderId, item.product_id, item.quantity, item.price, item.bread_type || null);
    }

    return orderId;
  });

  try {
    const orderId = transaction();
    res.status(201).json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order: ' + error.message });
  }
});

// Get all orders
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT orders.*, users.username as cashier_name 
      FROM orders 
      LEFT JOIN users ON orders.user_id = users.id
      ORDER BY created_at DESC
    `).all();

    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT 
          order_items.id,
          order_items.product_id,
          order_items.quantity,
          order_items.price,
          order_items.bread_type,
          products.name as product_name
        FROM order_items

        LEFT JOIN products ON order_items.product_id = products.id
        WHERE order_items.order_id = ?
      `).all(order.id);

      return {
        ...order,
        items: items || []
      };
    });

    res.json(ordersWithItems);
  } catch (error) {
    console.error('SERVER ERROR FETCHING ORDERS:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// Update order
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { items, total_amount, customer_name, customer_phone, customer_birthday } = req.body;

  const transaction = db.transaction(() => {
    // 1. Update order metadata
    const updateOrderStmt = db.prepare(`
      UPDATE orders 
      SET total_amount = ?, customer_name = ?, customer_phone = ?, customer_birthday = ?
      WHERE id = ?
    `);
    updateOrderStmt.run(total_amount, customer_name, customer_phone, customer_birthday, id);

    // 2. Delete existing items
    db.prepare("DELETE FROM order_items WHERE order_id = ?").run(id);

    // 3. Insert new items
    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price, bread_type) 
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItemStmt.run(id, item.product_id, item.quantity, item.price, item.bread_type || null);
    }
  });

  try {
    transaction();
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ error: 'Failed to update order: ' + error.message });
  }

});

// Get single order details
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const order = db.prepare(`
      SELECT orders.*, users.username as cashier_name 
      FROM orders 
      LEFT JOIN users ON orders.user_id = users.id
      WHERE orders.id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT order_items.*, products.name as product_name
      FROM order_items
      LEFT JOIN products ON order_items.product_id = products.id
      WHERE order_id = ?
    `).all(id);

    res.json({ ...order, items });
  } catch (error) {
    console.error('Fetch Order Detail Error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Delete order
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const transaction = db.transaction(() => {
    // Delete items first due to foreign key constraints (if any, though SQLite might not enforce by default, it's good practice)
    db.prepare("DELETE FROM order_items WHERE order_id = ?").run(id);
    const result = db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    return result.changes;
  });

  try {
    const changes = transaction();
    if (changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Print receipt via Python bridge
router.post('/print', (req, res) => {
  const orderData = req.body;



  const pythonProcess = spawn('py', [
    '-3.10',
    path.join(__dirname, '../print_receipt.py')
  ]);

  let output = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });



  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Printing failed:', errorOutput);
      return res.status(500).json({
        error: 'Printing failed',
        details: errorOutput || 'Unknown error'
      });
    }
    res.json({ message: 'Printing completed successfully', output });
  });

  // Send data via stdin
  pythonProcess.stdin.write(JSON.stringify(orderData), 'utf8');
  pythonProcess.stdin.end();
});

module.exports = router;

