const AccountDetails = require('../models/AccountDetails');
const logger = require('../logger');

async function getOneAccountByUserId(userId){
    try{
        const account = AccountDetails.findOne({ user_id: userId });
        return account;
    }catch(err){
        logerror(err.message);
        return;
    }
}

async function createAccountDetails(body){
    try{
        const account = await new AccountDetails(body).save();
        return account;
    }catch(err){
        logerror(err);
        return;
    }
}

async function editOneAccountByUserId(userId, body){
    try{
        const account = await AccountDetails.findOneAndUpdate({ user_id: userId }, body);
        return account;
    }catch(err){
        logerror(err.message);
        return;
    }
}

function logerror(msg){
    logger.error('in /db/accountdetailsdb.js: ', msg);
}

module.exports = { getOneAccountByUserId, createAccountDetails, editOneAccountByUserId };