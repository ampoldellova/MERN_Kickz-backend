const express = require('express');
const router = express.Router();

const{ newProduct } = require('../controllers/productController');

router.post('/product/new', newProduct);

module.exports = router;