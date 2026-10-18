const logger = require('../logger');
const Transactions = require('../models/Transactions');

async function addTransaction(body){
    try{
        const transaction = await new Transactions(body).save();
        return transaction;
    }catch(err){
        logerror(err);
        return;
    }
}

async function editTransactionByRef(tref, body){
    console.log("in edit transaction ", tref)
    try{
        await Transactions.findOneAndUpdate({ ref: tref }, body);

        const transaction = await Transactions.findOne({ref: tref})
        return transaction;
    }catch(err){
        logerror(err.message);
        return;
    }
}

async function getTransactionByRef(tref){
    console.log('in transactions db', tref);
    try{
        const transaction = await Transactions.findOne({ ref: tref });
        return transaction;
    }catch(err){
        logerror(err.message);
        return; 
    }
}

async function getTransactionsByUserId(id){
    try{
        const transactions = await Transactions.find(id)
        return transactions
    }catch(err){
        logerror(err.message)
        return;
    }
}

async function deleteTransactionByRef(ref){
    try{
        const transaction = await Transactions.findOneAndDelete({ ref: ref });
        return transaction;
    }catch(err){
        logerror(err.message);
        return;
    }
}

function logerror(msg){
    logger.error('in /db/transactions :', msg);
}

module.exports = { addTransaction, getTransactionByRef, getTransactionsByUserId, deleteTransactionByRef, editTransactionByRef };