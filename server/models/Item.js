const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },

  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },

  quantity: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },

  minQuantity: { 
    type: Number, 
    default: 0,
    min: [0, 'minQuantity cannot be negative']
  },

  unit: {
    type: String,
    enum: ['pcs', 'kg', 'litre', 'meter', 'box'], 
    default: 'pcs'
  },

  borrowable: {
    type: Boolean,
    default: false
  },

  borrowedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Borrowed quantity cannot be negative']
  },

  imageUrl: {
    type: String,
    validate: {
      validator: v => !v || /^https?:\/\/.+/.test(v),
      message: 'Invalid image URL'
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);