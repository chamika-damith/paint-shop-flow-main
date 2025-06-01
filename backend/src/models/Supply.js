const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  lastOrder: {
    type: Date,
    default: Date.now
  },
  supplierStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'On Hold'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supply', supplySchema); 