const CodePromo = require('../models/CodePromo')

exports.checkCodePromoIfExitBeforAdd = (req, res, next) => {
    CodePromo.count({promoName: req.body.promoName}).exec((err, codePromo) => {
        if(err)
            return res.status(400).json({error: err})
        if(codePromo > 0)
            return res.status(400).json({error: "code promo déjà existé"})
        if(req.body.discount > 100)
            return res.status(400).json({error: "copon ne doit pas supérieur de 100 percent"})

        next()
    })
}

exports.addNewCodePromo = (req, res) => {
    const codePromo = new CodePromo(req.body)

    codePromo.save((err, codePromo) => {
        if(err) {
            return res.status(400).json({error: err})
        }
        res.send(codePromo)
    })
}

exports.checkPromoCodeIsValid = (req, res) => {
    CodePromo.findOne({promoName: req.body.promoName, isActivated: true}).exec((err, codePromo) => {
        if(err)
            return res.status(400).json({error: err})
        if(!codePromo || codePromo.length == 0)
            return res.status(400).json({error: "invalid code promo"})

        res.json(codePromo.discount)
    })
}

