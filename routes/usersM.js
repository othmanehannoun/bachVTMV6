const express = require('express')
const router = express.Router()
const {signup, signin, verifiyOtp,resendOtp, userById, SignOut, updateUserPassword, getOneUser, checkThisEmailIfExist, AddBeneficiary,getBeneficiaryByUserId, TransferPoints, addRequest} = require('../controllers/userControllerM')
const {SignUpValidator} = require('../middllwars/formValidator')
const {requireSignIn, isAuth, isUser} = require('../middllwars/auth')

router.post('/signUp', SignUpValidator, checkThisEmailIfExist, signup)
router.post('/verfiyAccount', verifiyOtp)
router.post('/resendOtp', resendOtp)

router.post('/signIn', SignUpValidator, signin)
router.post('/signOut', SignOut)
router.put('/updateUserPassword/:UserID', updateUserPassword)
router.post('/addBeneficiary/:userId', AddBeneficiary)
router.put('/tresferPoint/:userIdTo/:userIdFrom', TransferPoints)
router.get('/getBeneficiaryByUser/:userId', getBeneficiaryByUserId)

router.get('/:Uid', requireSignIn, isAuth, isUser, getOneUser)
router.param('Uid', userById)


router.post('/testMethod', addRequest)

module.exports = router
