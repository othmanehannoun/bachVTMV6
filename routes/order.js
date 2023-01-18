const express = require('express')
const router = express.Router()

const {userById, getUserCurrentSold, updateThisUserSoldVitamix} = require('../controllers/userController')
const {addNewOrder, addNewOrderForAuthUser, addPointToThisUser, getOneUserPointList} = require('../controllers/orderController')
const {requireSignIn, isAuth, isUser} = require('../middllwars/auth')

// router.post('/:Uid', requireSignIn, isAuth, isUser, checkCodePromoIfExitBeforAdd, addNewCodePromo)
router.post('/', addNewOrder)

router.post('/addNewOrderForAuthUser/:Uid', requireSignIn, isAuth, isUser, addNewOrderForAuthUser, addPointToThisUser)
router.put('/userSoldVitamix/:Uid', requireSignIn, isAuth, isUser, getUserCurrentSold, updateThisUserSoldVitamix)
router.param('Uid', userById)

router.get('/:Uid', requireSignIn, isAuth, isUser, getOneUserPointList)

module.exports = router
