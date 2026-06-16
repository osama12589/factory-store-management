const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

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

    // explicit Number comparison — req.body values are strings
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
  getTransactions,
};
