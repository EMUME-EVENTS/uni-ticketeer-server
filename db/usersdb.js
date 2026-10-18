const logger = require('../logger');
const Users = require('../models/Users');
const bcrypt = require('bcryptjs');

async function getAllUsers(){
    try{
        const users = await Users.find()
        return users
    }catch(err){
        logerror("getAllUsers: "+err.message)
        return
    }
}

async function getUserBymail(email){
    try{
        const user = await Users.findOne({ email: email });
        return user;
    }catch(err){
        logerror("getuserBymail"+err.message);
        return null;
    }
}

const getUserByUsername = async (username)=>{
    try{
        const user = await Users.findOne({ username: username });
        return user;
    } catch(err){
        logerror("getUserByUsername"+err.message);
        return null;
    }
};

const getUserById = async(id)=>{
    try{
        const user = await Users.findById(id);
        return user;
    }catch(err){
        logerror("getUserById"+err.message);
        return;
    }
};

const addNewUser = async (newuser)=>{

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(newuser.password, salt);

    let user;

    if(newuser.phone_number){
        user = new Users({
            firstname: newuser.firstname,
            lastname: newuser.lastname,
            username: newuser.username,
            email: newuser.email,
            phone_number: `+234${newuser.phone_number}`,
            password: hash,
            gender: newuser.gender,
            usertype: newuser.usertype,
            location: newuser.location,
            tac: newuser.tac,
            mail_subscription: newuser.mail_subscription
        });
    } else if(!newuser.phone_number) {
        user = new Users({
            firstname: newuser.firstname,
            lastname: newuser.lastname,
            username: newuser.username,
            email: newuser.email,
            password: hash,
            gender: newuser.gender,
            usertype: newuser.usertype,
            location: newuser.location,
            tac: newuser.tac,
            mail_subscription: newuser.mail_subscription
        });
    }

    try {
        return await user.save();
    } catch(err){
        logerror("addNewUser"+err.message);
        return;
    }
    
};

async function editOneUser(id, body){
    try{
        const user = Users.findByIdAndUpdate(id, body);
        return user;
    }catch(err){
        logerror("editOneUser"+err.message);
        return;
    }
}

function logerror(msg){
    logger.error('in /db/usersdb.js :' + ' ' + msg);
}

module.exports = { getUserBymail, getUserByUsername, getUserById, addNewUser, editOneUser, getAllUsers };