const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const orderSchema = new mongoose.Schema({
    name: {
        type: String
    },
    adress: {
        type: String
    },
    phone: {
        type: String
    },
    fromUser: {
        type: ObjectId,
        ref: 'User'
    },
    items: [
        {
            category: {
                type: String
            },
            produits: {
                type: Array
            }
        }
    ],
    sumOnMAD: {
        type: Number
    },
    delivredOrTacked: {
        // D - T
        type: String
    },
    payWith: {
        // COD - CC
        type: String
    },
    usedPromoCode: {
        type: Boolean
    }
}, {timestamps: true})

module.exports = mongoose.model('Order', orderSchema)
