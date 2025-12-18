const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

const addStock = async (req, res) => {
  const { quantity } = req.body;

  const item = await Item.findById(req.params.id);
  item.quantity += Number(quantity);
  await item.save();

  const transaction = await Transaction.create({
    item: item._id,
    type: 'IN',
    quantity,
  });

  res.json({ item, transaction });
};

const issueStock = async (req, res) => {
  const { quantity, receiver } = req.body;
  const item = await Item.findById(req.params.id);

  if (item.quantity < quantity) {
    return res.status(400).json({ message: 'Not enough stock' });
  }

  item.quantity -= Number(quantity);
  await item.save();

  const transaction = await Transaction.create({
    item: item._id,
    type: 'OUT',
    quantity,
    receiver,
  });

  await transaction.populate('item', 'name unit');

  res.json({ item, transaction });
};

const borrowItem = async (req, res) => {
  try {
    const { quantity, receiver, expectedReturnDate, notes } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item.borrowable) {
      return res.status(400).json({ message: 'This item is not borrowable' });
    }

    const availableQty = item.quantity - item.borrowedQuantity;
    if (availableQty < quantity) {
      return res.status(400).json({ 
        message: `Not enough available stock. Available: ${availableQty}` 
      });
    }

    item.borrowedQuantity += Number(quantity);
    await item.save();

    const transaction = await Transaction.create({
      item: item._id,
      type: 'BORROW',
      quantity,
      receiver,
      expectedReturnDate,
      notes,
      status: 'PENDING'
    });

    await transaction.populate('item', 'name unit');

    res.json({ item, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const returnItem = async (req, res) => {
  try {
    const { borrowTransactionId, notes } = req.body;
    
    const borrowTransaction = await Transaction.findById(borrowTransactionId).populate('item');
    
    if (!borrowTransaction || borrowTransaction.type !== 'BORROW') {
      return res.status(400).json({ message: 'Invalid borrow transaction' });
    }

    if (borrowTransaction.status === 'RETURNED') {
      return res.status(400).json({ message: 'Item already returned' });
    }

    const item = await Item.findById(borrowTransaction.item._id);
    item.borrowedQuantity -= borrowTransaction.quantity;
    await item.save();

    borrowTransaction.status = 'RETURNED';
    borrowTransaction.returnedAt = new Date();
    await borrowTransaction.save();

    const returnTransaction = await Transaction.create({
      item: item._id,
      type: 'RETURN',
      quantity: borrowTransaction.quantity,
      receiver: borrowTransaction.receiver,
      borrowTransactionId: borrowTransaction._id,
      notes,
    });

    await returnTransaction.populate('item', 'name unit');

    res.json({ item, borrowTransaction, returnTransaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActiveBorrows = async (req, res) => {
  try {
    const borrows = await Transaction.find({ 
      type: 'BORROW', 
      status: { $in: ['PENDING', 'OVERDUE'] }
    })
      .populate('item', 'name unit imageUrl')
      .sort('-createdAt');

    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTransactions = async (req, res) => {
  const transactions = await Transaction.find()
    .populate('item', 'name unit')
    .sort('-createdAt');

  res.json(transactions);
};

module.exports = {
  addStock,
  issueStock,
  borrowItem,
  returnItem,
  getActiveBorrows,
  getTransactions,
};