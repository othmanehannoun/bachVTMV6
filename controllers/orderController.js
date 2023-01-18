const Order = require('../models/Order')
const UserPoint = require('../models/UserPoint')

exports.addNewOrder = (req, res) => {
    const order = new Order(req.body)

    order.save((err, order) => {
        if(err) {
            return res.status(400).json({error: err})
        }
        res.send()
    })
}

exports.addNewOrderForAuthUser = (req, res, next) => {
    const order = new Order(req.body)

    order.save((err, order) => {
        if(err) {
            return res.status(400).json({error: err})
        }

        req.orderInfo = order
        next()
    })
}

exports.addPointToThisUser = (req, res) => {
    req.body.fromUser = req.orderInfo.fromUser
    req.body.numberOfPoint = req.orderInfo.sumOnMAD * 0.1
    req.body.productList = req.orderInfo.items


    const userPoint = new UserPoint(req.body)

    userPoint.save((err, point) => {
        if(err) {
            return res.status(400).json({error: err})
        }
        res.send()
    })
}

exports.getOneUserPointList = (req, res) => {
    let Query = UserPoint.find({fromUser: req.params.Uid}).sort({createdAt: -1})

    Query.exec((err, point) => {
        if(err) {
            return res.status(400).json({error: err})
        }
        res.json(point)
    })
}
