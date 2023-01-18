const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')
const SubCategory = require('../models/SubCategory')
const Category = require('../models/Category')

const {decrypt, encrypt} = require('../middllwars/crypte')

const multer = require('multer')
const mime = require('mime-types')

const moment = require('moment')
moment.locale('fr');

const storageFiles = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/uploads/");
	},
	filename: (req, file, cb) => {
        let ext = mime.extension(file.mimetype);
		cb(null, file.fieldname + '-' + Date.now() + "." + ext);
	}
});

exports.storageFile = multer({storage: storageFiles}).single('productImg')

exports.oneProductDetails = (req, res) => {
    let Query = Product.findOne({_id: req.params.productID})

    Query.exec((err, product) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(product)
    })
}

exports.getCurrentProductName = (req, res, next) => {
    let Query = Product.findOne({_id: req.params.productID})

    Query.exec((err, product) => {
        if (err)
            return res.status(400).json({error: err})

            req.thisProductName = product.name
        next()
    })
}

exports.checkProductIsExistBeforeUpdate = (req, res, next) => {
    let Query = Product.findOne({name: req.body.name})

    Query.exec((err, product) => {
        if (err)
            return res.status(400).json({error: err})

        if(product && product.name != req.thisProductName)
            return res.status(400).json({error: "cette produit déjà existe"})

        next()
    })
}

exports.updateProduct = (req, res) => {
    let Object = req.file ? {...req.body,img: req.file.path}  : {...req.body}
    let Query = Product.updateOne({_id: req.params.productID}, Object, {upsert: true, rawResult: true, returnOriginal: false})

    Query.exec((err, product) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(product)
    })
}

exports.getSumOfOrders = (req, res, next) => {
    let Query = Order.find({}).countDocuments()
    Query.exec((err, order) => {
        if (err)
            res.status(400).json({error: err})

        req.sumOfOrder = order
        next()
    })
}

exports.getSumOfUsers = (req, res, next) => {
    let Query = User.find({}).countDocuments()
    Query.exec((err, user) => {
        if (err)
            res.status(400).json({error: err})

        req.sumOfUsers = user
        next()
    })
}

exports.getSumOfSells = (req, res, next) => {
    let Query = Order.find({}).select("sumOnMAD")
    Query.exec((err, sells) => {
        if (err)
            res.status(400).json({error: err})

        req.sumOfSells = sells.map(el => el.sumOnMAD).reduce((a, b) => a + b, 0)
        next()        
    })
}

exports.getTodaySells = (req, res, next) => {
    let Query = Order.find({})
    Query.exec((err, order) => {
        if (err)
            res.status(400).json({error: err})

            let currentYear = new Date().getFullYear()
            let currentMonth = ('0' + (new Date().getMonth()+1)).slice(-2)
            let currentDate = ('0' + (new Date().getDate())).slice(-2)

            var date = currentYear +'-'+ currentMonth +'-'+ currentDate

            // order.map(el => {
            //     console.log(moment(el.createdAt).format("YYYY-MM-DD"))
            // })

            let currentDayOrder = order.filter(el => moment(el.createdAt).format("YYYY-MM-DD") == date).map(el => el.sumOnMAD).reduce((a, b) => a + b, 0)

            req.currentDayOrder = currentDayOrder
            next()
    })
}

exports.dashboardData = (req, res) => {
    res.json({
        sumOfOrder: req.sumOfOrder,
        sumOfUsers: req.sumOfUsers,
        sumOfSells: req.sumOfSells,
        todaySells: req.currentDayOrder
    })
}

exports.getAllUserList = (req, res) => {
    let Query = User.find({})
    Query.exec((err, user) => {
        if (err)
            res.status(400).json({error: err})

        res.json(user)
    })
}

exports.getOneUserData = (req, res) => {
    let Query = User.findOne({_id: req.params.userID})
    Query.exec((err, user) => {
        if (err)
            res.status(400).json({error: err})

        user.password = decrypt(user.password)

        res.json(user)
    })
}

exports.currentUserEmail = (req, res, next) => {
    let Query = User.findOne({_id: req.params.userID})

    Query.exec((err, user) => {
        if (err)
            return res.status(400).json({error: err})

            req.connectedUserEmail = user.email
        next()
    })
}

exports.checkUpdateEmailIsExistBeforUpdate = (req, res, next) => {
    let Query = User.findOne({email: req.body.email})

    Query.exec((err, user) => {
        if (err)
            return res.status(400).json({error: err})

        if(user && user.email != req.connectedUserEmail)
            return res.status(400).json({error: "cette email déjà existe"})

        next()
    })
}

exports.updateOneUser = (req, res) => {
    let Query = User.updateOne({_id: req.params.userID}, req.body, {new: true, upsert: true})
    Query.exec((err, user) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(user)
    })
}

exports.getListOfCommande = (req, res) => {
    let Query = Order.find({})
    Query.exec((err, order) => {
        if (err)
            return res.status(400).json({error: err})

        let orderObject = []

        order.map(el => {
            orderObject.push({orderID: el._id, payMethode: el.payWith, orderTime: moment(el.createdAt).format("LT"), orderDate: moment(el.createdAt).format("YYYY-MM-DD"), totalePrice: el.sumOnMAD, type: el.delivredOrTacked})
        })

        res.json(orderObject.reverse())
    })
}

exports.getUserCurrentState = (req, res, next) => {
    let Query = User.findOne({_id: req.params.userID})

    Query.exec((err, state) => {
        if (err)
            return res.status(400).json({error: err})

        req.userCurrentState = state.isActive
        next()
    })
}

exports.changeUserState = (req, res) => {
    let Query = User.updateOne({_id: req.params.userID}, {isActive: !req.userCurrentState}, {upsert: true, rawResult: true, returnOriginal: false})
    Query.exec((err, user) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(!req.userCurrentState)
    })
}

exports.getListOfProducts = (req, res) => {
    let Query = Product.find({})
    Query.exec((err, product) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(product)
    })
}

exports.deleteOneProduct = (req, res) => {
    let Query = Product.deleteOne({_id: req.params.productID})
    Query.exec((err, product) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(product)
    })
}

exports.listOfSubCategory = (req, res) => {
    let Query = SubCategory.find({})

    Query.exec((err, subCategory) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(subCategory)
    })
}

exports.getCurrentCategoryName = (req, res, next) => {
    let Query = Category.findOne({_id: req.params.categoryID})

    Query.exec((err, category) => {
        if (err)
            return res.status(400).json({error: err})

            req.thisCategoryName = category.name
        next()
    })
}

exports.checkCategoryIsExistBeforeUpdate = (req, res, next) => {
    let Query = Category.findOne({name: req.body.name})

    Query.exec((err, category) => {
        if (err)
            return res.status(400).json({error: err})

        if(category && category.name != req.thisCategoryName)
            return res.status(400).json({error: "cette produit déjà existe"})

        next()
    })
}

exports.updateCategory = (req, res) => {
    let Object = req.file ? {...req.body,img: req.file.path}  : {...req.body}
    let Query = Category.updateOne({_id: req.params.categoryID}, Object, {upsert: true, rawResult: true, returnOriginal: false})

    Query.exec((err, category) => {
        if (err)
            return res.status(400).json({error: err})

        res.json(category)
    })
}
