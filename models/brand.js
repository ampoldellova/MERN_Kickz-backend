const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter brand name'],
        trim: true,
        maxLength: [100, 'Brand name cannot exceed 100 characters']
    },

    description: {
        type: String,
        required: [true, 'Please enter brand description'],
    },

    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
})

module.exports = mongoose.model('brand', brandSchema);