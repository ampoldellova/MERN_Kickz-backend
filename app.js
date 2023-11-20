const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const supplier = require('./routes/supplier');

app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use('/api/v1', supplier);

module.exports = app