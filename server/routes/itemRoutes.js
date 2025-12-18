const express = require('express');
const upload = require('../middleware/cloudinary');
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const router = express.Router();

router
  .route('/')
  .get(getItems)
  .post(upload.single('image'), createItem);

router
  .route('/:id')
  .put(upload.single('image'), updateItem)
  .delete(deleteItem);

module.exports = router;
