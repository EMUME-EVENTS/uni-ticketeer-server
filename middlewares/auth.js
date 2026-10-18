const jwt = require('jsonwebtoken');
const { getUserById } = require('../db/usersdb');

//normal users auth middlewares
async function isUserAuthenticated(req, res, next){
    const authToken = req.headers['ticketeer-auth-token'];
    if(!authToken){
        return res.status(401).json({ message: 'Unauthorized', data: null });
    }

    try{
        const decode = jwt.verify(authToken, process.env.AUTH_TOKEN_SECRET);
        req.user = decode;
        next();
    } catch(e){
        console.log(e);
        return res.status(401).json({ message: e.message, data: null });
    }
}

async function isUserOrganiser(req, res, next){
    const user = await getUserById(req.user.userId);

    if(user?.usertype !== 'organiser') {return res.status(403).json({ message: 'User is not authorized for this action', data: null });}

    next();
}

module.exports = { isUserAuthenticated, isUserOrganiser };