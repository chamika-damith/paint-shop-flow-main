const mongoose = require('mongoose');

const SUPPLIER_CATEGORIES = [
  'Paint Manufacturers',
  'Canvas Suppliers',
  'Brush Manufacturers',
  'Tool Suppliers',
  'Equipment Vendors',
  'Art Materials',
  'Packaging Suppliers',
  'Safety Equipment',
  'General Supplies'
];

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: SUPPLIER_CATEGORIES,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Hold'],
    default: 'Active'
  },
  inventoryItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem'
  }]
}, {
  timestamps: true
});

// Add index for better query performance
supplierSchema.index({ category: 1, status: 1 });

// Add a virtual for total items
supplierSchema.virtual('totalItems').get(function() {
  return (this.inventoryItems || []).length;
});

// Ensure virtuals are included in JSON output
supplierSchema.set('toJSON', { virtuals: true });
supplierSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Supplier', supplierSchema); 