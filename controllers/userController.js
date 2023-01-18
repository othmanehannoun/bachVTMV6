const User = require('../models/UserM')
const jwt = require('jsonwebtoken')

const {decrypt, encrypt} = require('../middllwars/crypte')

exports.getUserCurrentSold = (req, res, next) => {
    var Query = User.findOne({_id: req.params.Uid})
    Query.exec((err, user) => {
        if(err)
            return res.status(400).json({error: err})
        req.userCurrentSold = user
        next()
    })
}

exports.updateThisUserSoldVitamix = (req, res) => {
    if((parseInt(req.userCurrentSold.totalFont) - parseInt(req.body.sumOfPrice)) < 0)
        return res.status(400).json({error: "recharger votre font"})
    let restOfFont = parseInt(req.userCurrentSold.totalFont) - parseInt(req.body.sumOfPrice)
    var Query = User.updateOne({_id: req.params.Uid}, {totalFont: restOfFont}, {returnOriginal: true, new: true, upsert: true, rawResult: true})
    Query.exec((err, user) => {
        if(err)
            return res.status(400).json({error: err})

        res.json(user)
    })
}

exports.checkThisEmailIfExist = (req, res, next) => {
    User.find({email: req.body.email}, (err, data) => {
        if(err || !data || data.length >= 1)
            return res.status('400').json({error: "cette email déjà exist"})
        next()
    })
}

exports.signup = (req, res) => {
    try {
        if(req.body.confirmPass !== req.body.password || !req.body.confirmPass) {
            return res.status('400').json({error: "Les mots de passe saisis ne sont pas identiques. "})
        }
        const user = new User(req.body)
        user.save((err, user) => {
            if(err) {
                return res.status('400').json({error: err})
            }
            res.send(user)
        })
    }
    catch(error) {}
}

exports.signin = (req, res) => {
    try {
        const {email, password} = req.body
        User.findOne({email}, (err, user) => {
            if(err || !user) {
                return res.status(400).json({error: "Ce compte n'existe pas ! Veuillez-vous inscrire"})
            }
            if(!user.isActive) {
                return res.status(400).json({error: "Cette compte est désactivé"})
            }
            if(decrypt(user.password) != password) {
                return res.status(401).json({error: 'Veuillez entrer un mot de passe correct'})
            }

            // expire after 1 hours exp: Math.floor(Date.now() / 1000) + (60 * 60)
            const token = jwt.sign({_id: user._id, name: user.name,phone: user.phone, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + (60 * 60)}, process.env.JWT_SECRET, { algorithm: 'HS256' }); 
    
            res.cookie('token', token, { expire: new Date() + (60*24*3600000) })

            const {_id, name, email, role} = user;

            // return res.json({
            //     token, user: {_id, name, email, role}
            // })
            return res.json({ user: {_id, name, email, role, token} })
        })
    }
    catch(error) {
    }
}

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(404).json({
                error: "Ce compte n'existe pas ! Veuillez-vous inscrire"
            })
        }

        req.profile = user;
        next();
    })
}

exports.getOneUser = (req, res) => {
    res.json({
        user: req.profile
    })
}

exports.SignOut = (req, res) =>  {
    res.clearCookie('token');

    res.json({
        message: "Vous êtes déconnecté"
    })
}

exports.updateUserPassword = (req, res) => {
    if(req.body.Password != req.body.RPassword) {
        return res.status(400).json({error: "Les mots de passe saisis ne sont pas identiques"})
    }

    if(req.body.Password == "" || req.body.RPassword == "")
        return res.status(400).json({error: "Entrer votre mot de pass"})

    var userPasswordObject = {
        password: encrypt(req.body.Password),
    }

    User.findOneAndUpdate({_id: req.params.Uid}, userPasswordObject, (err, user) => {
        if(req.body.oldPassword != decrypt(user.password))
            return res.status(400).json({error: "Le mot de passe actuel saisi est incorrect"})
        if(err)
            return res.status(400).json({error: "server error"})

        res.json("le mot de pass a été modifiée")
    })
}

exports.checkUserIfAlreadyExist = (req, res, next) => {
    let Query = User.findOne({email: req.body.email})

    Query.exec((err, user) => {
        if(err)
            return res.status(400).json({error: err})

        next()
    })
}

exports.updateUserInfo = (req, res) => {
    var userObject = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    }
    User.findOneAndUpdate({_id: req.params.Uid}, userObject, (err, user) => {
        if(err)
            return res.status(400).json({error: err})

        res.json("votre information a été modifié")
    })
}