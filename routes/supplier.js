const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { newSupplier, getSupplier, updateSupplier, deleteSupplier, getSingleSupplier } = require('../controllers/supplyController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/admin/supplier/:id', getSingleSupplier);
router.post('/admin/supplier/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), newSupplier);
router.get('/admin/suppliers', isAuthenticatedUser, authorizeRoles('admin'), getSupplier);
router.route('/admin/supplier/:id', isAuthenticatedUser, authorizeRoles('admin')).put(updateSupplier).delete(deleteSupplier);

module.exports = router;