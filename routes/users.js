const express = require('express');
const router = express.Router();

const {
    userRegValidation, 
    loginValidation, 
    withdrawalValidation, 
    accountDetailsValidation,
    changePasswordValidation,
    verificationTokenValidation,
    resetPasswordValidation
} = require('../middlewares/validations')
const {createUser, getUser, editUser, withdrawOrganiserfunds, addAccountDetails, getAccountDetails, editAccountDetails, editUserPassword, getTransactionHistory, sendForgotPasswordLink, resetUserPassword, getOrganiserStats} = require('../controllers/usersController')
const {authenticateUser} = require('../controllers/authController')

const { isUserAuthenticated, isUserOrganiser } = require('../middlewares/auth');
const { processWithdrawal } = require('../middlewares/process');
const { generateAndSendMailVerificationToken, verifyMailToken } = require('../controllers/VerificationController');

router.get('/verifymail/:userid/:token', verifyMailToken)
router.get('/forgot-password', sendForgotPasswordLink)

router.get('/profile', isUserAuthenticated, getUser);
router.get('/organiserstats', isUserAuthenticated, isUserOrganiser, getOrganiserStats)
router.get('/accountdetails', isUserAuthenticated, isUserOrganiser, getAccountDetails);
router.get('/transaction/history', isUserAuthenticated, isUserOrganiser, getTransactionHistory)

router.post('/accountdetails', isUserAuthenticated, isUserOrganiser, accountDetailsValidation, addAccountDetails);
router.post('/withdraw', isUserAuthenticated, isUserOrganiser, withdrawalValidation, processWithdrawal, withdrawOrganiserfunds);

router.put('/profile/edit/:id', isUserAuthenticated, userRegValidation, editUser);
router.put('/accountdetails', isUserAuthenticated, isUserOrganiser, editAccountDetails);

router.post('/register', userRegValidation, createUser)
router.post('/login', loginValidation, authenticateUser)

router.post('/generate/verificationtoken', verificationTokenValidation, generateAndSendMailVerificationToken)
router.post('/change-password', isUserAuthenticated, changePasswordValidation, editUserPassword)
router.post('/reset-password', resetPasswordValidation, resetUserPassword)

module.exports = router;