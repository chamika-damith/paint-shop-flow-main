const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Get all inventory items
router.get('/', inventoryController.getAllItems);

// Get a single inventory item
router.get('/:id', inventoryController.getItemById);

// Create a new inventory item
router.post('/', inventoryController.createItem);

// Update an inventory item
router.put('/:id', inventoryController.updateItem);

// Delete an inventory item
router.delete('/:id', inventoryController.deleteItem);

module.exports = router; 