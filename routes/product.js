const express = require('express');
const router = express.Router();

const{ getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.get('/products', getProducts);
router.post('/product/new', newProduct);
router.get('/product/:id', getSingleProduct);
router.route('/admin/product/:id').put(updateProduct).delete(deleteProduct);

module.exports = router;