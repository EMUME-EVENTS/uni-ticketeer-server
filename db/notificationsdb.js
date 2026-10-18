const logger = require('../logger');
const Notifications = require('../models/Notifications');

async function addNotification(body){
    try{
        const notification = await new Notifications(body).save();
        return notification;
    }catch(err){
        logerror(err.message);
        return;
    }
}

function logerror(msg){
    logger.error('in /db/notificationsdb: ', msg);
}

module.exports = { addNotification };