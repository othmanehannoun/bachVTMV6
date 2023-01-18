const mongoose = require('mongoose')
const {encrypt} = require('../middllwars/crypte')

const promoCodeSchema = new mongoose.Schema({
    promoName: {
        type: String,
        default: ""
    },
    codePromo: {
        type: Object
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number
    }
}, {timestamps: true})

promoCodeSchema.pre('save', function(next) {
    this.codePromo = encrypt(this.codePromo)
    next()
});

module.exports = mongoose.model('CodePromo', promoCodeSchema)
