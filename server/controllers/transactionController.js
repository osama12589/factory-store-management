const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

// ─── Add Stock (IN) ───────────────────────────────────────────────────────────
const addStock = async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const parsedQty = Number(quantity);

    if (!parsedQty || parsedQty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity += parsedQty;
    await item.save();

    const transaction = await Transaction.create({
      item: item._id,
      type: 'IN',
      quantity: parsedQty,
      notes: notes || undefined,
    });

    res.status(201).json({ item, transaction });
  } catch (err) {
    console.error('addStock error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Issue Stock (OUT) ────────────────────────────────────────────────────────
const issueStock = async (req, res) => {
  try {
    const { quantity, receiver, notes } = req.body;
    const parsedQty = Number(quantity);

    if (!parsedQty || parsedQty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    if (!receiver || !receiver.trim()) {
      return res.status(400).json({ message: 'Receiver is required for OUT transactions' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.quantity < parsedQty) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${item.quantity} ${item.unit}`,
      });
    }

    item.quantity -= parsedQty;
    await item.save();

    const transaction = await Transaction.create({
      item: item._id,
      type: 'OUT',
      quantity: parsedQty,
      receiver: receiver.trim(),
      notes: notes || undefined,
    });

    await transaction.populate('item', 'name unit');

    res.status(201).json({ item, transaction });
  } catch (err) {
    console.error('issueStock error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Borrow Item ──────────────────────────────────────────────────────────────
const borrowItem = async (req, res) => {
  try {
    const { quantity, borrower, notes, expectedReturnDate } = req.body;
    const parsedQty = Number(quantity);

    if (!parsedQty || parsedQty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    if (!borrower || !borrower.trim()) {
      return res.status(400).json({ message: 'Borrower name is required' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.quantity < parsedQty) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${item.quantity} ${item.unit}`,
      });
    }

    item.quantity -= parsedQty;
    await item.save();

    const transaction = await Transaction.create({
      item: item._id,
      type: 'BORROW',
      quantity: parsedQty,
      borrower: borrower.trim(),
      notes: notes || undefined,
      expectedReturnDate: expectedReturnDate || undefined,
      returned: false,
    });

    await transaction.populate('item', 'name unit');

    res.status(201).json({ item, transaction });
  } catch (err) {
    console.error('borrowItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Return Borrowed Item ─────────────────────────────────────────────────────
const returnItem = async (req, res) => {
  try {
    const { transactionId, notes } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'transactionId is required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Borrow transaction not found' });
    }

    if (transaction.type !== 'BORROW') {
      return res.status(400).json({ message: 'Transaction is not a borrow record' });
    }

    if (transaction.returned) {
      return res.status(400).json({ message: 'Item has already been returned' });
    }

    const item = await Item.findById(transaction.item);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity += transaction.quantity;
    await item.save();

    transaction.returned = true;
    transaction.returnedAt = new Date();
    if (notes) transaction.notes = notes;
    await transaction.save();

    await transaction.populate('item', 'name unit');

    res.status(200).json({ item, transaction });
  } catch (err) {
    console.error('returnItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Get Active (Unreturned) Borrows ─────────────────────────────────────────
const getActiveBorrows = async (req, res) => {
  try {
    const borrows = await Transaction.find({ type: 'BORROW', returned: false })
      .populate('item', 'name unit')
      .sort('-createdAt');

    res.json(borrows);
  } catch (err) {
    console.error('getActiveBorrows error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Get All Transactions ─────────────────────────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('item', 'name unit')
      .sort('-createdAt');

    res.json(transactions);
  } catch (err) {
    console.error('getTransactions error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addStock,
  issueStock,
  borrowItem,
  returnItem,
  getActiveBorrows,
  getTransactions,
};