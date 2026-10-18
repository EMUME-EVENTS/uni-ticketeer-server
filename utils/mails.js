const nodemailer = require("nodemailer")
const logger = require("../logger")

async function sendMail(to, subject, text){
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.WELCOME_MAIL_USERNAME,
                pass: process.env.WELCOME_MAIL_PASSWORD
            }
        })
    
       async function send(){
        let info = await transporter.sendMail({
            from: process.env.WELCOME_MAIL_USERNAME,
            to: to,
            subject: subject,
            text: text
        })
        console.log("info", info.messageId)
       }
    
       send()
    }catch(err){
        logger.error("in /utils/mails: "+err)
    }
}

async function sendMailVerificationLink(usermail, userId, token){
    let link = `${process.env.FRONTEND_HOST}auth/verify-mail?userid=${userId}&token=${token}`
    let messageBody = `Click on the link to verify your email: ${link}, this link expires in one hour`
    await sendMail(usermail, "Verify Your Email", messageBody)
}

async function sendForgotPasswordLinkMail(usermail, userId, token){
    let link = `${process.env.FRONTEND_HOST}auth/reset-password?userid=${userId}&token=${token}`
    let messageBody = `Follow the link to reset your password: ${link} . This link expires in on hour`
    await sendMail(usermail, "Reset Password Link", messageBody)
}

module.exports = {
    sendMailVerificationLink,
    sendForgotPasswordLinkMail
}