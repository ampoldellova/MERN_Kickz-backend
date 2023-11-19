const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct, getAdminProducts } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin',), upload.array('images', 10), newProduct);
router.route('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin')).put(updateProduct).delete(deleteProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

module.exports = router;