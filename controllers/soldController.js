const Sold = require('../models/SoldVitamix')

exports.addSold = (req, res) => {
    const sold = new Sold(req.body)

    sold.save((err, sold) => {
        if(err) {
            return res.status('400').json({error: err})
        }

        res.send(sold)
    })
}

exports.getOneUserSold = (req, res) => {
    Sold.findOne({_id: req.params.userProfileID}).exec((err, data) => {
        if(err)
            res.status(400).json({error: err})

        res.json(data.userSold)
    })
}
