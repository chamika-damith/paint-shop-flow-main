const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Paints', 'Brushes', 'Canvases', 'Tools', 'Equipment', 'Paper', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['In Stock', 'Out of Stock', 'Low Stock'],
    default: 'In Stock'
  },
  description: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on quantity
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.quantity <= process.env.LOW_STOCK_THRESHOLD || 10) {
    this.status = this.quantity === 0 ? 'Out of Stock' : 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  
  next();
});

// Virtual for formatted ID
inventorySchema.virtual('formattedId').get(function() {
  return `INV${this._id.toString().slice(-6).toUpperCase()}`;
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory; 