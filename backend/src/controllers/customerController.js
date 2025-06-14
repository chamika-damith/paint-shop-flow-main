const Customer = require('../models/Customer');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer order history by email
exports.getCustomerOrderHistory = async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find customer first to verify existence
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Find orders for this customer
    // Adjust the query based on your Order model structure
    const orders = await Order.find({ 
      customerEmail: email // or customerId: customer._id, depending on your schema
    }).sort({ date: -1 }); // Sort by date, newest first

    // Transform orders to match the expected format
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      date: order.date || order.createdAt,
      amount: order.amount || order.total,
      status: order.status,
      items: order.items || []
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    // Check for required fields
    const requiredFields = ['name', 'contactPerson', 'email', 'password', 'phone', 'address', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }
    
    // Validate password
    if (req.body.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check for existing email
    const existing = await Customer.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ message: 'A customer with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log('Password hashed successfully, length:', hashedPassword.length);
    
    const customer = new Customer({
      name: req.body.name,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address,
      category: req.body.category,
      status: req.body.status || 'Active',
      isAdmin: req.body.isAdmin || false,
    });
    
    const newCustomer = await customer.save();
    console.log('Customer created successfully:', newCustomer.email);
    
    // Return customer without password
    const { password: _, ...customerResponse } = newCustomer.toObject();
    res.status(201).json(customerResponse);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Customer login - EMAIL ONLY VERSION
exports.loginCustomer = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Validate input - only email required
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find customer by email only
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found with this email' });
    }

    // Check if customer is active
    if (customer.status !== 'Active') {
      return res.status(400).json({ message: 'Customer account is not active' });
    }

    console.log('Customer login successful:', customer.email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: customer._id.toString(), // Convert ObjectId to string
        email: customer.email, 
        isAdmin: customer.isAdmin || false 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return response with properly formatted customer object
    res.json({ 
      token, 
      customer: { 
        id: customer._id.toString(), // Convert ObjectId to string for frontend
        email: customer.email, 
        name: customer.name, 
        isAdmin: customer.isAdmin || false,
        contactPerson: customer.contactPerson,
        phone: customer.phone,
        address: customer.address,
        category: customer.category,
        status: customer.status
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      Object.assign(customer, req.body);
      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      await customer.deleteOne();
      res.json({ message: 'Customer deleted' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};