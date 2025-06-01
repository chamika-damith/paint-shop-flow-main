const express = require('express');
const router = express.Router();
const suppliesController = require('../controllers/suppliesController');

// Get all supplies
router.get('/', suppliesController.getAllSupplies);

// Get a single supply
router.get('/:id', suppliesController.getSupplyById);

// Create a new supply
router.post('/', suppliesController.createSupply);

// Update a supply
router.put('/:id', suppliesController.updateSupply);

// Delete a supply
router.delete('/:id', suppliesController.deleteSupply);

// Update supplier status
router.patch('/:id/status', suppliesController.updateSupplierStatus);

// Create order
router.post('/:id/order', suppliesController.createOrder);

module.exports = router; 