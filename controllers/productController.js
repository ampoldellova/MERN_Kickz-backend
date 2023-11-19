const Product = require('../models/product');
const Order = require('../models/order')
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary')

exports.newProduct = async (req, res, next) => {

	let images = []
	if (typeof req.body.images === 'string') {
		images.push(req.body.images)
	} else {
		images = req.body.images.flat()
	}

	let imagesLinks = [];

	for (let i = 0; i < images.length; i++) {
		let imageDataUri = images[i]
		// console.log(imageDataUri)
		try {
			const result = await cloudinary.v2.uploader.upload(`${imageDataUri}`, {
				folder: 'Kickz/products',
				width: 150,
				crop: "scale",
			});

			imagesLinks.push({
				public_id: result.public_id,
				url: result.secure_url
			})

		} catch (error) {
			console.log(error)
		}

	}

	req.body.images = imagesLinks
	req.body.user = req.user.id;

	const product = await Product.create(req.body);
	if (!product)
		return res.status(400).json({
			success: false,
			message: 'Product not created'
		})


	res.status(201).json({
		success: true,
		product
	})
}

exports.getProducts = async (req, res, next) => {

	const resPerPage = 4;
	const productsCount = await Product.countDocuments();
	const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter();

	apiFeatures.pagination(resPerPage);
	const products = await apiFeatures.query;
	let filteredProductsCount = products.length;
	res.status(200).json({
		success: true,
		filteredProductsCount,
		productsCount,
		products,
		resPerPage,
	})
}

exports.getSingleProduct = async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	res.status(200).json({
		success: true,
		product
	})
}

exports.updateProduct = async (req, res, next) => {
	let product = await Product.findById(req.params.id);
	console.log(req.body)
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	if (req.body.images) {
		let images = []
		console.log(typeof req.body.images)

		if (typeof req.body.images === 'string') {
			images.push(req.body.images)
		} else {
			images = req.body.images.flat()
		}
		if (images !== undefined) {
			// Deleting images associated with the product
			for (let i = 0; i < product.images.length; i++) {
				const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
			}
		}
		let imagesLinks = [];
		for (let i = 0; i < images.length; i++) {
			const result = await cloudinary.v2.uploader.upload(images[i], {
				folder: 'Kickz/products'
			});
			imagesLinks.push({
				public_id: result.public_id,
				url: result.secure_url
			})

		}
		req.body.images = imagesLinks
	}

	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindandModify: false
	})
	// console.log(product)
	return res.status(200).json({
		success: true,
		product
	})
}

exports.deleteProduct = async (req, res, next) => {
	const product = await Product.findByIdAndDelete(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	// await product.remove();
	res.status(200).json({
		success: true,
		message: 'Product deleted'
	})
}

exports.getAdminProducts = async (req, res, next) => {

	const products = await Product.find();

	res.status(200).json({
		success: true,
		products
	})

}