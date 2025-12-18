require('dotenv').config();           // ← MUST BE FIRST LINE!

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes - now safe to import
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => res.send('Factory Store API Running'));

const PORT = process.env.PORT || 5000;
module.exports = app;
