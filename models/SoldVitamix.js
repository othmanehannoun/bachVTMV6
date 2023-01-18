const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const SoldSchema = new mongoose.Schema({
    fromUser: {
        type: ObjectId,
        ref: 'User'
    },
    userSold: {
        type: Number,
    },
}, {timestamps: true})

module.exports = mongoose.model('Sold', SoldSchema)
