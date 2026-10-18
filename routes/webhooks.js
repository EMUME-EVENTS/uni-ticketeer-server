const express = require('express');
const { transactionHook } = require('../controllers/webhooksController');
const router = express.Router()

router.post("/paystack", transactionHook)

module.exports = router