const Supplier = require('../models/Supplier');
const InventoryItem = require('../models/InventoryItem');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate('inventoryItems', 'name category quantity status');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single supplier
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('inventoryItems', 'name category quantity price status');
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
  const supplier = new Supplier({
    name: req.body.name,
    contactPerson: req.body.contactPerson,
    email: req.body.email,
    phone: req.body.phone,
    category: req.body.category,
    status: req.body.status
  });

  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ message: 'A supplier with this email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    // Check for email uniqueness if email is being updated
    if (req.body.email) {
      const existingSupplier = await Supplier.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingSupplier) {
        return res.status(400).json({ message: 'A supplier with this email already exists' });
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    // Check if supplier has any inventory items
    const inventoryItems = await InventoryItem.find({ supplier: req.params.id });
    if (inventoryItems.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete supplier with existing inventory items. Please reassign or delete the items first.' 
      });
    }

    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get supplier's inventory items
exports.getSupplierInventory = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const inventoryItems = await InventoryItem.find({ supplier: supplier._id })
      .select('name category quantity price status reorderPoint');
    
    res.json(inventoryItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get suppliers by category
exports.getSuppliersByCategory = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ category: req.params.category })
      .populate('inventoryItems', 'name category quantity status');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update supplier status
exports.updateSupplierStatus = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.status = req.body.status;
    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 