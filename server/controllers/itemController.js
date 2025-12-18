const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

const getItems = async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};

  const items = await Item.find(query)
    .populate('category', 'name')
    .sort('-createdAt');

  res.json(items);
};

const createItem = async (req, res) => {
  try {
    const { name, category, quantity, minQuantity, unit, borrowable } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const item = await Item.create({
      name,
      category,
      quantity: quantity || 0,
      minQuantity: minQuantity || 0,
      unit: unit || 'pcs',
      borrowable: borrowable === 'true' || borrowable === true,
      imageUrl,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if ('borrowable' in updates) {
      updates.borrowable = updates.borrowable === 'true' || updates.borrowable === true;
    }
    
    if (req.file) updates.imageUrl = req.file.path;

    const item = await Item.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    res.json(item);
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteItem = async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};