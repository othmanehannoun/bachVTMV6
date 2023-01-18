const mongoose = require('mongoose')
const {encrypt, decrypt} = require('../middllwars/crypte')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: Object,
        required: true
    },
    phone: {
        type: String
    },
    role: {
        type: Number,
        default: 0
    },
    pointFidilite: {
        type: Number,
        default: 0
    },
    totalFont: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

userSchema.pre('save', function(next) {
    this.password = encrypt(this.password)
    next()
});

module.exports = mongoose.model('User', userSchema)
