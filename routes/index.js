const express = require('express');
const path = require('path');
const { handleImageUpload, handleSaveWaitingListMail, verifyPayment, confirmWithdrawal, getBankList } = require('../controllers/indexController');
const { waitListValidation } = require('../middlewares/validations');
const router = express.Router();

router.get('/', (req, res)=>{
    console.log(req.host, req.get('origin'))
    res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/verifypayment', verifyPayment);
router.post('/confirmwithdrawal', confirmWithdrawal);
router.post('/waiting-list', waitListValidation, handleSaveWaitingListMail)

//router.get('/flutterwave-banklist', getBankList);
router.get('/paystack-banklist', getBankList)

router.post('/uploadimage', handleImageUpload);

module.exports = router;