const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { newSupplier } = require('../controllers/supplyController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.post('/admin/supplier/new', isAuthenticatedUser, authorizeRoles('admin',), upload.array('images', 10), newSupplier);

module.exports = router;