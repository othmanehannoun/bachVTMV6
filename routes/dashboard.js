const express = require('express')
const router = express.Router()
const {getSumOfOrders, getSumOfUsers, getSumOfSells, getTodaySells, dashboardData, getAllUserList, getOneUserData, currentUserEmail, checkUpdateEmailIsExistBeforUpdate, updateOneUser, getListOfCommande, getUserCurrentState, changeUserState, getListOfProducts, storageFile, getCurrentProductName, checkProductIsExistBeforeUpdate, updateProduct, deleteOneProduct, listOfSubCategory, getCurrentCategoryName, checkCategoryIsExistBeforeUpdate, updateCategory} = require('../controllers/dashboardController')
const {userById} = require('../controllers/superAdminController')
const {requireSignIn, isAuth, isSuperAdmin} = require('../middllwars/auth')

router.get('/dashboardData/:Uid', requireSignIn, isAuth, isSuperAdmin, getSumOfOrders, getSumOfUsers, getSumOfSells, getTodaySells, dashboardData)
router.get('/userLists/:Uid', requireSignIn, isAuth, isSuperAdmin, getAllUserList)
router.get('/oneUserData/:Uid/:userID', requireSignIn, isAuth, isSuperAdmin, getOneUserData)
router.get('/commandeList/:Uid', requireSignIn, isAuth, isSuperAdmin, getListOfCommande)
router.get('/productsList/:Uid', requireSignIn, isAuth, isSuperAdmin, getListOfProducts)
router.get('/subCategory/:Uid', requireSignIn, isAuth, isSuperAdmin, listOfSubCategory)

router.put('/updateOneUserData/:Uid/:userID', requireSignIn, isAuth, isSuperAdmin, currentUserEmail, checkUpdateEmailIsExistBeforUpdate, updateOneUser)
router.put('/changeUserState/:Uid/:userID', requireSignIn, isAuth, isSuperAdmin, getUserCurrentState, changeUserState)
router.put('/updateProduct/:Uid/:categoryID', requireSignIn, isAuth, isSuperAdmin, storageFile, getCurrentProductName, checkProductIsExistBeforeUpdate, updateProduct)
router.put('/updateCategory/:Uid/:productID', requireSignIn, isAuth, isSuperAdmin, storageFile, getCurrentCategoryName, checkCategoryIsExistBeforeUpdate, updateCategory)

router.delete('/deleteProduct/:Uid/:productID', requireSignIn, isAuth, isSuperAdmin, deleteOneProduct)

router.param('Uid', userById)

// router.put('/updateUserPassword/:Uid',requireSignIn, isAuth, isSuperAdmin, updateUserPassword)
// router.get('/:Uid', requireSignIn, isAuth, isSuperAdmin, getOneUser)

module.exports = router
