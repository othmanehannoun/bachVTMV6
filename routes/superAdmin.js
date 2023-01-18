const express = require('express')
const router = express.Router()
const {signup, signin, userById, SignOut, getOneUser, checkThisEmailIfExist, updateUserPassword, checkUserIfAlreadyExist, updateUserInfo} = require('../controllers/superAdminController')
const {SignUpValidator} = require('../middllwars/formValidator')
const {requireSignIn, isAuth, isSuperAdmin} = require('../middllwars/auth')

router.post('/signUp', SignUpValidator, checkThisEmailIfExist, signup)
router.post('/signIn', SignUpValidator, signin)
router.post('/signOut', SignOut)
router.put('/updateUserPassword/:Uid',requireSignIn, isAuth, isSuperAdmin, updateUserPassword)

router.get('/:Uid', requireSignIn, isAuth, isSuperAdmin, getOneUser)
router.param('Uid', userById)

module.exports = router
