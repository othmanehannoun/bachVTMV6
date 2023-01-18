const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const userPointSchema = new mongoose.Schema({
    fromUser: {
        type: ObjectId,
        ref: 'User'
    },
    numberOfPoint: {
        type: Number,
    },
    productList: [
        {
            category: {
                type: String
            },
            produits: {
                type: Array
            }
        }
    ],
}, {timestamps: true})

module.exports = mongoose.model('UserPoint', userPointSchema)
