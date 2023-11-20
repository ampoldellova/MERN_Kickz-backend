const mongoose = require('mongoose')

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter Supplier name'],
        trim: true,
        maxLength: [100, 'Supplier name cannot exceed 100 characters']
    },

    description: {
        type: String,
        required: [true, 'Please enter Supplier description'],
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

module.exports = mongoose.model('Supplier', supplierSchema);