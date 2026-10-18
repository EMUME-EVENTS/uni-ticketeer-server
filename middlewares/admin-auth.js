const { getAdminById } = require("../db/admindb");
const jwt = require("jsonwebtoken")

//admin auth middleware
async function isAdminAuthenticated(req, res, next){
    const authToken = req.headers['admin-auth-token']
    console.log("auth token ", authToken)
    if(!authToken){
        return res.status(401).json({ message: 'Admin Action Unauthorized', data: null });
    }

    try{
        const decode = jwt.verify(authToken, process.env.ADMIN_AUTH_TOKEN_SECRET);
        req.admin = decode;
        next();
    } catch(e){
        console.log(e);
        return res.status(401).json({ message: e.message, data: null });
    }
}

async function canAdminCreate(req, res, next){
    const admin = await getAdminById(req.admin.userId);

    if(!admin?.roles.includes('create')) {return res.status(403).json({ message: 'Admin does not have Create permission', data: null });}

    next();
}

async function canAdminEdit(req, res, next){
    const admin = await getAdminById(req.admin.userId)

    if(!admin?.roles.includes('edit')) return res.status(403).json({message: 'Admin does not have Edit permission', data: null})

    next()
}

async function canAdminDelete(req, res, next){
    const admin = await getAdminById(req.admin.userId)

    if(!admin?.roles.includes('delete')) return res.status(403).json({message: 'Admin does not have Delete permission', data: null})

    next()
}

async function canAdminRead(req, res, next){
    const admin = await getAdminById(req.admin.userId)

    if(!admin?.roles.includes('read')) return res.status(403).json({message: "Admin does not have Read permission", data: null})

    next()        
}


module.exports = {
    isAdminAuthenticated,
    canAdminRead,
    canAdminCreate,
    canAdminEdit,
    canAdminDelete
}