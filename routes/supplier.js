const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { newSupplier, getSupplier } = require('../controllers/supplyController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.post('/admin/supplier/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), newSupplier);
router.get('/admin/suppliers', isAuthenticatedUser, authorizeRoles('admin'), getSupplier);


module.exports = router;