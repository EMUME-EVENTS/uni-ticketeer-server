const logger = require("../logger");
const VerificationToken = require("../models/VerificationTokens")

async function createToken(body){
    try{
        let existingToken = await VerificationToken.findOne({user_id: body.user_id})
        if(existingToken){
            await VerificationToken.deleteOne({user_id: body.user_id})
        }
        let token = await new VerificationToken(body).save()
        return token
    }catch(err){
        logerror(err.msg)
        return
    }
}

async function findTokenByUserId(userId){
    try{
        let token = await VerificationToken.findOne({user_id: userId})
        return token
    }catch(err){
        logerror(err.msg || err)
        return
    }
}

async function deleteTokenByUserId(userId){
    try{
        let token = await VerificationToken.deleteOne({user_id: userId})
        return token
    }catch(err){
        logerror(err.msg || err)
        return
    }
}

function logerror(msg){
    logger.error('in /db/verificationtokens :', msg);
}

module.exports = {
    createToken,
    findTokenByUserId,
    deleteTokenByUserId
}