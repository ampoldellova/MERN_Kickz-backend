const Supplier = require('../models/supplier');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary')

exports.newSupplier = async (req, res, next) => {

	let images = []
	if (typeof req.body.images === 'string') {
		images.push(req.body.images)
	} else {
		images = req.body.images.flat()
	}

	let imagesLinks = [];

	for (let i = 0; i < images.length; i++) {
		let imageDataUri = images[i]

		try {
			const result = await cloudinary.v2.uploader.upload(`${imageDataUri}`, {
				folder: 'Kickz/suppliers',
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

	const supplier = await Supplier.create(req.body);
	if (!supplier)
		return res.status(400).json({
			success: false,
			message: 'Supplier not created'
		})


	res.status(201).json({
		success: true,
		supplier
	})
}

exports.getSupplier = async (req, res, next) => {

	const supplier = await Supplier.find();

	res.status(200).json({
		success: true,
		supplier
	})
}

exports.getSingleSupplier = async (req, res, next) => {
	const supplier = await Supplier.findById(req.params.id);
	if (!supplier) {
		return res.status(404).json({
			success: false,
			message: 'Supplier not found'
		})
	}
	res.status(200).json({
		success: true,
		supplier
	})
}
