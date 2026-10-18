const path = require('path');
const Flutterwave = require('flutterwave-node-v3');
const axios = require('axios');
const { deleteTransactionByRef, getTransactionByRef, editTransactionByRef } = require('../db/transactionsdb');
const { settlePlannersAndEmptyCart } = require('../utils/paymentLogic');
const logger = require('../logger');
const s3 = require('../utils/s3');
const { v4: uuidv4 } = require('uuid');
const { addToWaitList, getSingleWaitlistByMail } = require('../db/waitlistdb');

console.log("public key paystack: ", process.env.PAYSTACK_PUBLIC_KEY, "private key PAYSTACK: ", process.env.PAYSTACK_SECRET_KEY)

function handleImageUpload(req, res) {
    console.log(req.files);

    if (req.files?.img) {
        const maxSize = 3 * 1024 * 1024;

        if (req.files.img.size > maxSize) {
            return res.status(413).json({ message: 'File should not be larger than 3mb', data: null });
        }

        const img = req.files.img;
        const uploadKey = `images/${Date.now()}-${uuidv4()}-${img.name}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uploadKey,
            Body: img.data,
            ContentType: img.mimetype
            // ACL: 'public-read',
        };

        s3.upload(params, function(err, data) {
            if (err) {
                logger.error(err.message);
                return res.status(500).json({ message: 'An error occurred', data: null });
            }

            return res.status(201).json({ message: 'Image uploaded successfully', data: { url: data.Location } });
        });
    } else {
        return res.status(400).json({ message: 'File name "img" is required', data: null });
    }
}

async function verifyPayment(req, res){
    try{
        console.log(req.query);
        
        //verify payment
        console.log('txref', req.query.trxref);
        let transaction = await getTransactionByRef(req.query.reference);
        let response = await axios.get(`https://api.paystack.co/transaction/verify/${req.query.reference}`,{
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })
        console.log('transaction fetched', transaction);
        console.log('checking payment: response', response.data);
       
        if (response.data.status == false) {
            let deletedTransaction = await deleteTransactionByRef(req.query.trxref);
    
            return res.status(400).json({ message: response.data.message, data: null });
        }
        console.log("after checking response status...")
        if(response.data.status == true && response.data.data.amount == transaction.amount * 100 && response.data.data.currency == 'NGN'){
            console.log("before checking transaction status")
            if(transaction.status == 'complete') {return res.status(200).json({ message: 'Payment already resolved', data: null });}
            console.log('payment verified... resolving and updating related info ');
            transaction = await editTransactionByRef(req.query.reference, { status: 'complete' });
            console.log("transaction have been set to complete... moving to settle planners")
            await settlePlannersAndEmptyCart(transaction.customer.email);
        
            //notify user
            return res.status(200).json({ message: 'Transaction verified and completed', data: transaction });
        }else{
            console.log("something failed after checking response")
        }
    
    }catch(err){
        res.status(500).json({ message: 'A server error occured' });
        logger.error('in /controllers/indexController: ');
    }
}

async function handleSaveWaitingListMail(req, res){
    console.log("mail", req.body.mail)
    try{
        let waitlist = await getSingleWaitlistByMail(req.body.email)
        if(waitlist) return res.status(400).json({message: "You already Joined the Waitlist", data: null})

        waitlist = await addToWaitList({email: req.body.email})
        if(!waitlist) return res.status(500).json({message: "An Error Occured", data: null})

        res.status(200).json({message: "You have Successfully Joined the waitlist", data: null})
    }catch(err){
        logger.error("in /controllers/indexController handleWaitingListMail:" + err.message || err)
    }
}

async function confirmWithdrawal(req, res){
    console.log(req.body);
    try{

    }catch(err){

    }
}

async function getBankList(req, res){
    try{
        const response = await axios.get('https://api.paystack.co/bank?country=nigeria',{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization':  `Bearer ${process.env.PAYSTACK_SECRET_KEY}` 
            }
        });

        console.log(response.data.data)
        return res.status(200).json({message: "Bank list fetched", data: response.data.data})
    }catch(err){
        res.status(500).json({ message: 'An unkonwn error occured' });
        logger.error('in /controllers/indexController: ', err.message);
        return;
    }
}

module.exports = { handleImageUpload, verifyPayment, getBankList, confirmWithdrawal, handleSaveWaitingListMail };