const logger = require('../logger');
const Events = require('../models/Events');

//get requests
async function getAllEvents(){
    try{
        const events = await Events.find();
        return events;
    } catch(err){
        logerror(err.message);
        return;
    }
}

async function getOneEvent(id){
    try{
        const event = await Events.findById(id);
        return event;
    } catch(err){
        logerror(err.message);
        return;
    }
}

//post requests
async function addOneEvent(body){
    try{
        const event = await new Events(body).save();
        return event;
    }catch(err){
        logerror(err.message);
        return;
    }
}

//put requests
async function editOneEvent(id, body){
    try{
        await Events.findOneAndUpdate({ _id: id }, body);

        const event = await Events.findById(id);
        return event;
    }catch(err){
        logerror(err.message);
        return;
    }
}

//delete requests
async function deleteOneEvent(id){
    try{
        const event = await Events.findByIdAndDelete(id);

        return event;
    }catch(err){
        logerror(err.message);
        return;
    }
}

async function getAllUserEvents(userId){
    try{
        const events = await Events.find({ organiser: userId });
        return events;
    } catch(err){
        logerror(err.message);
        return null;
    }
}

function logerror(msg){
    logger.error('in /eventsdb.js :'+ ' ' + msg);
}

module.exports = { getAllEvents, getOneEvent, getAllUserEvents, addOneEvent, editOneEvent, deleteOneEvent };