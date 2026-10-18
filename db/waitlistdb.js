const logger = require("../logger")
const Waitlist = require("../models/Waitlist")
async function getAllWaitlist(){
    try {
        let waitlist = await Waitlist.find()
        return waitlist
    }catch(err){
        logerror(err.msg || err)
    }
}

async function getSingleWaitlistByMail(email){
    try{
        let waitlist = await Waitlist.findOne({email})
        return waitlist
    }catch(err){
        logerror(err.msg || err)
    }
}

async function addToWaitList(body){
    try{
        let waitlist = await new Waitlist(body).save()
        return waitlist
    }catch(err){
        logerror(err.msg || err)
    }
}

function logerror(msg){
    logger.error('in /db/verificationtokens :', msg);
}

module.exports = {
    getAllWaitlist,
    addToWaitList,
    getSingleWaitlistByMail
}