const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Regular', 'VIP', 'Corporate'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Hold'],
    default: 'Active',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Update `updatedAt` before findOneAndUpdate and updateOne
customerSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

customerSchema.pre('updateOne', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
