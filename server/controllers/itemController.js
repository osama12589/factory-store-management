const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

const getItems = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const items = await Item.find(query)
      .populate('category', 'name')
      .sort('-createdAt');

    res.json(items);
  } catch (err) {
    console.error('getItems error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ... existing imports ...

const createItem = async (req, res) => {
  try {
    // ADDED: borrowable
    const { name, category, quantity, minQuantity, unit, borrowable } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const item = await Item.create({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      unit: unit || 'pcs',
      imageUrl,
      // CONVERT string to boolean
      borrowable: borrowable === 'true',
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('createItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    // ADDED: borrowable
    const { name, category, minQuantity, unit, borrowable } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category;
    if (minQuantity !== undefined) updates.minQuantity = Number(minQuantity);
    if (unit !== undefined) updates.unit = unit;
    
    // CONVERT string to boolean
    if (borrowable !== undefined) updates.borrowable = borrowable === 'true';
    if (req.file) updates.imageUrl = req.file.path;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    console.error('updateItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ... keep existing getItems, deleteItem, and module.exports ...

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Remove all transactions tied to this item before deleting
    await Transaction.deleteMany({ item: req.params.id });
    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item and its transaction history deleted' });
  } catch (err) {
    console.error('deleteItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};
