const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserBymail, editOneUser } = require('../db/usersdb');
const logger = require('../logger');

const authenticateUser = async (req, res)=>{
    try{
        const user = await getUserBymail(req.body.email);
        console.log("user gotten", user)
        if(!user) {return res.status(400).json({ message: 'User does not exist', data: null });}
    
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);

        if(!isPasswordMatch) {return res.status(401).json({ message: 'Password is incorrect', data: null });}

        let editedUser = await editOneUser(user._id, {last_logged_in: new Date()})

        user.password = undefined;
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.usertype }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '24h' });

    
        return res.status(200).json({ message: 'Logged in successfully', data:{ data: editedUser, token: token } });

    } catch(err){
        logger.error('in /controllers/authController.js:' + ' ' +err.message);
        return res.status(500).json({message: "An internal server error occured"});
    }
};

module.exports = { authenticateUser };