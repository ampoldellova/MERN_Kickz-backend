const User = require('../models/user');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('cloudinary')
const crypto = require('crypto')
const bcrypt = require("bcryptjs");

exports.google = async (req, res, next) => {
    try {
        const { email, name, avatar } = req.body;

        const existingUser = await User.findOne({ email });

        let avatarData;

        if (avatar) {

            await cloudinary.v2.uploader.upload(
                avatar,
                {
                    folder: "Kickz/avatars",
                    width: 200,
                    crop: "scale",
                },
                (err, result) => {
                    if (err) {
                        console.error("Error uploading avatar to Cloudinary:", err);
                        throw err;
                    }
                    avatarData = {
                        public_id: result.public_id,
                        url: result.url,
                    };
                }
            );
        }

        if (existingUser) {

            sendToken(existingUser, 200, res);
        } else {

            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                avatar: avatarData,
            });

            await newUser.save();

            sendToken(newUser, 201, res);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.registerUser = async (req, res, next) => {
    console.log(req.file)
    console.log(req.files)
    console.log(req.body)
    if (req.body.avatar) {
        // req.body.avatar = req.file.path

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'Kickz/avatars',
            width: 150,
            crop: "scale"
        })
        req.body.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    let images = []
    if (req.body.images) {

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
                    folder: 'Kickz/coverPhotos',
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
    }

    const { name, email, password, role } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: req.body.avatar,
        images: req.body.images
        // role,
    })

    // const token = user.getJwtToken();
    if (!user) {
        return res.status(500).json({
            success: false,
            message: 'user not created'
        })
    }
    sendToken(user, 200, res)

}

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' })
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    sendToken(user, 200, res)
}

exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })
        // return next(new ErrorHandler('User not found with this email', 404));
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset password url
    const resetUrl = `${req.protocol}://localhost:3000/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Kickz Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })
        // return next(new ErrorHandler(error.message, 500))
    }
}

exports.resetPassword = async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })
        // return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })
        // return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
}

exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('password');
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res)

}

exports.updateProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id)
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== '') {

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
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
            for (let i = 0; i < user.images.length; i++) {
                const result = await cloudinary.v2.uploader.destroy(user.images[i].public_id)
            }
        }

        let imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'Kickz/coverPhotos'
            });
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })

        }
        newUserData.images = imagesLinks
    }

    const userUpdate = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    if (!userUpdate) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    res.status(200).json({
        success: true
    })
}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        // useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(401).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    // Remove avatar from cloudinary
    const image_id = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(image_id);
    await User.findByIdAndRemove(req.params.id);
    return res.status(200).json({
        success: true,
    })
}