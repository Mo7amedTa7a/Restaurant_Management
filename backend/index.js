require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

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
});
