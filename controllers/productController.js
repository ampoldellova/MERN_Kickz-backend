const Product = require('../models/product')

exports.newProduct = async (req, res, next) => {
	// req.body.user = req.user.id;
	const product = await Product.create(req.body);
	res.status(201).json({
		success: true,
		product
	})
}