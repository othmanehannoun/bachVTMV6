const express = require('express')
const router = express.Router()
const {addSold, getOneUserSold} = require('../controllers/soldController')
const {} = require('../middllwars/formValidator')
const {requireSignIn, isAuth, isSuperAdmin} = require('../middllwars/auth')
const {userById} = require('../controllers/superAdminController')

router.post('/:Uid', requireSignIn, isAuth, isSuperAdmin, addSold)
router.get('/:userProfileID', getOneUserSold)

router.param('Uid', userById)

module.exports = router
