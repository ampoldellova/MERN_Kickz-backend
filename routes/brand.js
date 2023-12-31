const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { newBrand, getBrand, updateBrand, deleteBrand, getSingleBrand } = require('../controllers/brandController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/admin/brand/:id', getSingleBrand);
router.post('/admin/brand/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), newBrand);
router.get('/admin/brands', getBrand);
router.route('/admin/brand/:id', isAuthenticatedUser, authorizeRoles('admin')).put(updateBrand).delete(deleteBrand);

module.exports = router;