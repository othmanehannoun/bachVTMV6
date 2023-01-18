const express = require('express')
const router = express.Router()
const {userById, getUserCurrentSold, updateThisUserSoldVitamix} = require('../controllers/userController')
const {addOrder, getOrderByUserId, getOneOrder, addPointToThisUser} = require('../controllers/OrderControllerM')
const {requireSignIn, isAuth, isUser} = require('../middllwars/auth')

router.post('/add/:Uid', requireSignIn, isAuth, isUser, addOrder, addPointToThisUser)
// router.post('/add', addOrder, addPointToThisUser)
router.put('/userSoldVitamix/:Uid',requireSignIn, isAuth, isUser, getUserCurrentSold, updateThisUserSoldVitamix)
// router.get('/getAll', getAllSubCategory)
router.get('/findUserOrder/:userId', getOrderByUserId)
router.get('/findOrder/:id', getOneOrder)

router.param('Uid', userById)

module.exports = router
