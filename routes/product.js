const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct, getAdminProducts, productSales } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin',), upload.array('images', 10), newProduct);
router.route('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin')).delete(deleteProduct);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), updateProduct)
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
router.get('/admin/product-sales', productSales);

module.exports = router;