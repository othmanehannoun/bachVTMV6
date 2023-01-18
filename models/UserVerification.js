const mongoose = require('mongoose')

const userVerificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        // required: true
    },
    otp: {
        type: String,
        // required: true
    },
    // expiredAt: {
    //     type: Date,
    //     default: Date
    // }
   
}, {timestamps: true})


// module.exports = mongoose.model('User', userSchema);

module.exports = mongoose.model('UserVerification', userVerificationSchema);

 



