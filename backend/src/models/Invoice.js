const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
invoiceSchema.index({ customer: 1, status: 1 });

// Add a pre-save hook to check for overdue invoices
invoiceSchema.pre('save', function(next) {
  if (this.dueDate && this.status === 'Pending') {
    if (new Date(this.dueDate) < new Date()) {
      this.status = 'Overdue';
    }
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema); 