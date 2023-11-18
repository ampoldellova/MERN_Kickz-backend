const express = require('express');
const router = express.Router();

const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct, getAdminProducts } = require('../controllers/productController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.get('/products', getProducts);
router.post('/product/new', newProduct);
router.get('/product/:id', getSingleProduct);
router.route('/admin/product/:id', isAuthenticatedUser).put(updateProduct).delete(deleteProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

module.exports = router;