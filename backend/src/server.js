const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require('./routes/supplierRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { scheduleLowStockCheck } = require('./config/scheduler');
const Customer = require('./models/Customer');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Ensure default admin user exists
async function ensureAdminUser() {
  const adminEmail = 'admin@paintshop.com';
  const adminPassword = 'admin123';
  let admin = await Customer.findOne({ email: adminEmail });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await Customer.create({
      name: 'Admin',
      contactPerson: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      phone: '0000000000',
      address: 'Admin Address',
      category: 'Regular',
      status: 'Active',
      isAdmin: true,
    });
    console.log('Default admin user created');
  }
}

// Initialize low stock check scheduler
scheduleLowStockCheck();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/customers', customerRoutes);
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/suppliers', supplierRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 