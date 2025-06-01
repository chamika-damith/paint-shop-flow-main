const Supply = require('../models/Supply');

// Get all supplies
exports.getAllSupplies = async (req, res) => {
  try {
    const supplies = await Supply.find();
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single supply
exports.getSupplyById = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }
    res.json(supply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new supply
exports.createSupply = async (req, res) => {
  const supply = new Supply({
    name: req.body.name,
    supplier: req.body.supplier,
    quantity: req.body.quantity,
    reorderPoint: req.body.reorderPoint,
    status: req.body.status,
    lastOrder: req.body.lastOrder,
    supplierStatus: req.body.supplierStatus
  });

  try {
    const newSupply = await supply.save();
    res.status(201).json(newSupply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a supply
exports.updateSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    Object.assign(supply, req.body);
    const updatedSupply = await supply.save();
    res.json(updatedSupply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a supply
exports.deleteSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    await supply.remove();
    res.json({ message: 'Supply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update supplier status
exports.updateSupplierStatus = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    supply.supplierStatus = req.body.supplierStatus;
    const updatedSupply = await supply.save();
    res.json(updatedSupply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    supply.quantity += req.body.quantity;
    supply.lastOrder = new Date();
    const updatedSupply = await supply.save();
    res.json(updatedSupply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 