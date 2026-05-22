require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const representativeRoutes = require('./routes/representatives');
const hassalaRoutes = require('./routes/hassala');
const personalHassalaRoutes = require('./routes/personal_hassala');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/representatives', representativeRoutes);
app.use('/api/hassala', hassalaRoutes);
app.use('/api/personal-hassala', personalHassalaRoutes);

app.listen(PORT, () => {
  console.log(`Server started at ${new Date().toLocaleString()} on port ${PORT}`);
  
  // Start Python print server in the background
  const pythonProcess = spawn('py', ['-3.10', path.join(__dirname, 'print_receipt.py'), '5050']);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Print Server: ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Print Server Error: ${data.toString().trim()}`);
  });

  // Ensure python process is killed when node exits
  const killPython = () => {
    if (!pythonProcess.killed) {
      pythonProcess.kill();
    }
  };

  process.on('exit', killPython);
  process.on('SIGINT', () => { killPython(); process.exit(); });
  process.on('SIGTERM', () => { killPython(); process.exit(); });
  process.on('uncaughtException', (err) => {
    console.error(err);
    killPython();
    process.exit(1);
  });
});
