const express = require('express')
const router = express.Router()

const {userById} = require('../controllers/userController')
const {checkCodePromoIfExitBeforAdd, addNewCodePromo, checkPromoCodeIsValid} = require('../controllers/codePromoController')
const {requireSignIn, isAuth, isUser} = require('../middllwars/auth')

router.post('/:Uid', requireSignIn, isAuth, isUser, checkCodePromoIfExitBeforAdd, addNewCodePromo)
router.post('/', checkPromoCodeIsValid)
router.param('Uid', userById)

module.exports = router
