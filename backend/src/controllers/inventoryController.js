const InventoryItem = require('../models/InventoryItem');
const Supplier = require('../models/Supplier');

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().populate('supplier', 'name email category');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single inventory item
exports.getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id).populate('supplier', 'name email category');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new inventory item
exports.createItem = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'category', 'quantity', 'price', 'supplier'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate supplier
    let supplierId = req.body.supplier;
    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return res.status(400).json({ message: 'Invalid supplier ID' });
      }
      if (supplier.status !== 'Active') {
        return res.status(400).json({ message: 'Supplier is not active' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid supplier ID format' });
    }

    // Create new item with validated data
    const item = new InventoryItem({
      name: req.body.name,
      category: req.body.category,
      quantity: Math.max(0, parseInt(req.body.quantity) || 0),
      price: Math.max(0, parseFloat(req.body.price) || 0),
      supplier: supplierId,
      description: req.body.description || '',
      reorderPoint: parseInt(req.body.reorderPoint) || 10,
      status: req.body.status || (
        parseInt(req.body.quantity) === 0 ? 'Out of Stock' : 
        parseInt(req.body.quantity) <= 10 ? 'Low Stock' : 
        'In Stock'
      )
    });

    const newItem = await item.save();
    const populatedItem = await InventoryItem.findById(newItem._id)
      .populate('supplier', 'name email category');
    
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create inventory item',
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
};

// Update an inventory item
exports.updateItem = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Remove undefined or null values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null) {
        delete updates[key];
      }
    });

    // Handle supplier update
    if (updates.supplier) {
      try {
        const supplier = await Supplier.findById(updates.supplier);
        if (!supplier) {
          return res.status(400).json({ message: 'Supplier not found' });
        }
        if (supplier.status !== 'Active') {
          return res.status(400).json({ message: 'Supplier is not active' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Invalid supplier ID format' });
      }
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update and validate numeric fields
    if (updates.quantity !== undefined) {
      updates.quantity = Math.max(0, parseInt(updates.quantity) || 0);
    }
    if (updates.price !== undefined) {
      updates.price = Math.max(0, parseFloat(updates.price) || 0);
    }
    if (updates.reorderPoint !== undefined) {
      updates.reorderPoint = Math.max(0, parseInt(updates.reorderPoint) || 10);
    }

    // Update status based on quantity if quantity is being updated
    if (updates.quantity !== undefined && !updates.status) {
      updates.status = 
        updates.quantity === 0 ? 'Out of Stock' : 
        updates.quantity <= (item.reorderPoint || 10) ? 'Low Stock' : 
        'In Stock';
    }

    // Update only the fields that are present in the request
    Object.keys(updates).forEach(key => {
      item[key] = updates[key];
    });

    const updatedItem = await item.save();
    const populatedItem = await InventoryItem.findById(updatedItem._id)
      .populate('supplier', 'name email category');
    
    res.json(populatedItem);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to update inventory item',
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
};

// Delete an inventory item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 