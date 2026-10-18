const logger = require("../logger");
const Admins = require("../models/Admins");

async function getAdminById(id){
    try{
        let admin = await Admins.findById(id)
        return admin
    }catch(err){
        logerror(err.message)
        return
    }
}

async function getAdminByMail(email){
    try{
        let admin = await Admins.findOne({email})
        return admin
    }catch(err){
        logerror(err.message)
        return
    }
}

async function getAllAdmins(){
    try{
        let admins = await Admins.find()
        return admins
    }catch(err){
        logerror(err.message)
        return
    }
}

async function addAdmin(body){
    try{
        let admin = await new Admins(body).save()
        return admin
    }catch(err){
        logerror(err.message)
        return
    }
}

async function editAdmin(id, body){
    try{
        let admin = await Admins.findByIdAndUpdate(id, body)
        return admin
    }catch(err){
        logerror(err.message)
        return
    }
}

function logerror(msg){
    logger.error("in db/admindb.js: "+msg)
}

module.exports = {
    getAdminById,
    getAdminByMail,
    getAllAdmins,
    addAdmin,
    editAdmin
}