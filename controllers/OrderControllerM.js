const Order = require('../models/OrderM')
const UserPoint = require('../models/UserPoint')
const User = require('../models/UserM')


exports.addOrder = (req, res, next) => {
    const order = new Order(req.body)

    order.save((err, order) => {
        if(err) {
            return res.status(400).json({error: err})
        }

        req.orderInfo = order
        next()
    })
}

exports.addPointToThisUser = async(req, res) => {
    req.body.fromUser = req.orderInfo.userId
    req.body.numberOfPoint = req.orderInfo.totalPrice * 0.1
    // req.body.productList = req.orderInfo.products

    const userPoint = new UserPoint(req.body)

    userPoint.save( async(err, point) => {
        if(err) {
            return res.status(400).json({error: err})
        }

        const user = await User.findById(req.body.fromUser);
        if(user){
            await User.findByIdAndUpdate(req.body.fromUser,
                {
                   Point_Fidilite: user.Point_Fidilite  + Number(req.body.numberOfPoint)
                }, 
                
           )
        }
        else{
            res.status(400).json("ERRROR")
        }

        res.send(req.orderInfo)
        
    })
}


//GET USER ORDERS
exports.getOrderByUserId = (req, res) => {
  Order.find({userId: req.params.userId}).exec((err, order) => {
      if(err)
          return res.status('400').json({error: err})
      res.send(order)
  })
}

//GET USER ORDERS
exports.getOneOrder = (req, res) => {
  Order.findOne({_id: req.params.id}).exec((err, order) => {
      if(err)
          return res.status('400').json({error: err})
      res.send(order)
  })
}





// exports.getAllSubCategory = (req, res) => {
//     SubCategory.find({}).exec((err, subCategory) => {
//         if(err) {
//             return res.status('400').json({error: err})
//         }

//         res.send(subCategory)
//     })
// }

// exports.getAllSubCategoryFromOneCategory = (req, res) => {
//     SubCategory.find({fromCategory: req.params.subCID}).select('name').exec((err, subCategory) => {
//         if(err) {
//             return res.status('400').json({error: err})
//         }

//         res.send(subCategory)
//     })
// }
