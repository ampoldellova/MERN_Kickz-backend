const Brand = require('../models/brand');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary')

exports.newBrand = async (req, res, next) => {

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
				folder: 'Kickz/brands',
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

	const brand = await Brand.create(req.body);
	if (!brand)
		return res.status(400).json({
			success: false,
			message: 'Brand not created'
		})


	res.status(201).json({
		success: true,
		brand
	})
}

exports.getBrand = async (req, res, next) => {

	const brand = await Brand.find();

	res.status(200).json({
		success: true,
		brand
	})
}

exports.getSingleBrand = async (req, res, next) => {
	const brand = await Brand.findById(req.params.id);
	if (!brand) {
		return res.status(404).json({
			success: false,
			message: 'Brand not found'
		})
	}
	res.status(200).json({
		success: true,
		brand
	})
}

exports.updateBrand = async (req, res, next) => {
	let brand = await Brand.findById(req.params.id);
	console.log(req.body)
	if (!brand) {
		return res.status(404).json({
			success: false,
			message: 'Brand not found'
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
			for (let i = 0; i < brand.images.length; i++) {
				const result = await cloudinary.v2.uploader.destroy(brand.images[i].public_id)
			}
		}
		let imagesLinks = [];
		for (let i = 0; i < images.length; i++) {
			const result = await cloudinary.v2.uploader.upload(images[i], {
				folder: 'Kickz/brands'
			});
			imagesLinks.push({
				public_id: result.public_id,
				url: result.secure_url
			})

		}
		req.body.images = imagesLinks
	}

	brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindandModify: false
	})

	return res.status(200).json({
		success: true,
		brand
	})
}

exports.deleteBrand = async (req, res, next) => {
	const brand = await Brand.findByIdAndDelete(req.params.id);
	if (!brand) {
		return res.status(404).json({
			success: false,
			message: 'Brand not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'Brand deleted'
	})
}