const mongoose = require('mongoose')
const {encrypt, decrypt} = require('../middllwars/crypte')

const superAdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: Object,
        required: true
    },
    role: {
        type: Number,
        default: 1
    }
}, {timestamps: true})

superAdminSchema.pre('save', function(next) {
    this.password = encrypt(this.password)
    next()
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema)
