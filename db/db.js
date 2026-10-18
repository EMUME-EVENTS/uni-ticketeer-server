const mongoose = require('mongoose');
const logger = require('../logger');

function connectDB(string){
    mongoose.connect(string).then(()=>{
        logger.info('DB connected');
    }).catch((err)=>{
        logger.error('in /db/db.js :' + ' ' + err.message + string);
        return;
    });
}

module.exports = { connectDB };