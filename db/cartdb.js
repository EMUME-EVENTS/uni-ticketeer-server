const logger = require('../logger');
const Cart = require('../models/Cart');
const { getUserById } = require('./usersdb');

async function addOneItem(body){
    try{
        const cartItem = await new Cart(body).save();
        return cartItem;
    }catch(err){
        logerror(err);
    }
}

async function getOneCartItem(cartId){
    try{
        const cartItem = await Cart.findById(cartId)
        return cartItem
    }catch(err){
        logerror(err.message)
    }
}

async function getCartByUserId(userId){
    
    try{

        const user = await getUserById(userId);
        if(!user) {return null;}

        const userinfo = {
            user_id: user.id,
            user_name: user.username,
            user_email: user.email
        };

        const items = await Cart.find({ user_info: userinfo });
        return items;
    }catch(err){
        logerror(err.message);
    }
}

async function deleteOneItem(itemid){
    try{
        const item = await Cart.findByIdAndDelete(itemid);
        return item;
    }catch(err){
        logerror(err.message);
    }
}

function logerror(msg){
    logger.error('in /db/cartdb.js :', msg);
}

module.exports = { addOneItem, getCartByUserId, getOneCartItem, deleteOneItem };