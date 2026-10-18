const { default: axios } = require("axios");
const { getTransactionByRef, editTransactionByRef } = require("../db/transactionsdb");
const { editOneUser, getUserById } = require("../db/usersdb");

async function transactionHook(req, res){
    console.log("webhook endpoint hit", req.body)
    res.sendStatus(200)
    try{
        if(req.body.event == 'transfer.success'){
            console.log("transaction ref", req.body.data.reference)
            let reference = req.body.data.reference

            let transaction  = await getTransactionByRef(reference);
            //verify the transaction
            let response = await axios.get(`https://api.paystack.co/transfer/verify/${reference}`,{
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            })
            console.log('transaction fetched', transaction);
            console.log('checking payment: response', response.data.data);

            if(transaction.status == 'complete') return
            
            let organiser = await getUserById(transaction.organiser_id)
            
            await editOneUser(transaction.organiser_id, {account: {
                balance: organiser.account.balance - (response.data.data.amount / 100)
            }})

            await editTransactionByRef(reference, {status: 'complete'})
        }
    }catch(err){
        console.log(err.data)
        throw new Error(err)
    }
}

module.exports = { transactionHook }