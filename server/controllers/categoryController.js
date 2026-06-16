const Category = require('../models/Category');
const Item = require('../models/Item');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (err) {
    // MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    console.error('createCategory error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    console.error('updateCategory error:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Block deletion if items are still assigned to this category
    const itemCount = await Item.countDocuments({ category: req.params.id });
    if (itemCount > 0) {
      return res.status(400).json({
        message: `Cannot delete — ${itemCount} item(s) are still assigned to this category. Reassign or delete them first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
