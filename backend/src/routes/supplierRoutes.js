const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Get all suppliers
router.get('/', supplierController.getAllSuppliers);

// Get suppliers by category
router.get('/category/:category', supplierController.getSuppliersByCategory);

// Get a single supplier
router.get('/:id', supplierController.getSupplierById);

// Get supplier's inventory items
router.get('/:id/inventory', supplierController.getSupplierInventory);

// Create a new supplier
router.post('/', supplierController.createSupplier);

// Update a supplier
router.put('/:id', supplierController.updateSupplier);

// Update supplier status
router.patch('/:id/status', supplierController.updateSupplierStatus);

// Delete a supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router; 