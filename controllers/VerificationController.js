const crypto = require("crypto")
const VerificationToken = require("../models/VerificationTokens")
const { getUserById, editOneUser, getUserBymail } = require("../db/usersdb")
const { sendMailVerificationLink } = require("../utils/mails")
const { findTokenByUserId, createToken, deleteTokenByUserId } = require("../db/verificationtokensdb")

async function generateAndSendMailVerificationToken(req, res){
    let email = req.body.email
    let user = await getUserBymail(email)
    if(!user) return res.status(400).json({message: "User not found", data: null})

    let token = await createToken({
        user_id: user._id,
        token: crypto.randomBytes(32).toString('hex')
    })

    if(!token) return res.status(500).json({message: "An Error Occured", data: null})
    await sendMailVerificationLink(user.email, user._id, token.token)

    return res.status(200).json({message: "Link Generated, check your mail"})
}

async function verifyMailToken(req, res){
    let userid = req.params.userid
    let token = req.params.token

    let user = await getUserById(userid)
    if(!user) return res.status(400).json({message: "User not found", data: null})

    let tokenObject = await findTokenByUserId(userid)
    if(!tokenObject) return res.status(400).json({message: "Missing or expired token", data: null})

    if(token !== tokenObject.token) {
        let deletedToken = await deleteTokenByUserId(userid)
        if(!deletedToken) return res.status(500).json({message: "An unknown error occured", data: null})
        
        return res.status(400).json({message: "Invalid Token", data: null})
    }

    let editedUser = await editOneUser(userid, {is_email_verified: true})
    if(!editedUser) return res.status(500).json({message: "An error occured", data: null})

    await deleteTokenByUserId(userid)

    return res.status(200).json({message: "Email verification successfull"})
}

module.exports = {
    generateAndSendMailVerificationToken,
    verifyMailToken
}