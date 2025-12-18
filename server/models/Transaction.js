const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },

  type: {
    type: String,
    enum: ['IN', 'OUT', 'BORROW', 'RETURN'],
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },

  receiver: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.type === 'OUT' || this.type === 'BORROW') return !!v;
        if (this.type === 'IN') return !v;
        return true;
      },
      message: 'Receiver is required for OUT/BORROW and not allowed for IN',
    },
  },

  borrowTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: function() {
      return this.type === 'RETURN';
    }
  },

  expectedReturnDate: {
    type: Date,
    required: function() {
      return this.type === 'BORROW';
    }
  },

  returnedAt: {
    type: Date
  },

  status: {
    type: String,
    enum: ['PENDING', 'RETURNED', 'OVERDUE'],
    default: function() {
      return this.type === 'BORROW' ? 'PENDING' : undefined;
    }
  },

  notes: {
    type: String,
    trim: true,
    maxlength: 200,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  }

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);