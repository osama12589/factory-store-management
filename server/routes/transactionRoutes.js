const express = require('express');
const {
  addStock,
  issueStock,
  borrowItem,
  returnItem,
  getActiveBorrows,
  getTransactions,
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/add-stock/:id', addStock);
router.post('/issue/:id', issueStock);
router.post('/borrow/:id', borrowItem);
router.post('/return', returnItem);
router.get('/active-borrows', getActiveBorrows);
router.get('/', getTransactions);

module.exports = router;