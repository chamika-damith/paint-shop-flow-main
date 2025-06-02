const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get a single customer
router.get('/:id', customerController.getCustomerById);

// Get customer order history by email
router.get('/:email/orders', customerController.getCustomerOrderHistory);

// Create a new customer
router.post('/', customerController.createCustomer);

// Update a customer
router.put('/:id', customerController.updateCustomer);

// Delete a customer
router.delete('/:id', customerController.deleteCustomer);

// Customer login
router.post('/login', customerController.loginCustomer);

module.exports = router;