const { getAllEvents, getOneEvent, getAllUserEvents, addOneEvent, editOneEvent, deleteOneEvent } = require('../db/eventsdb');
const { getUserById } = require('../db/usersdb');
const logger = require('../logger');
const { isEventPast, isStartAtInPresent, isEndAtLaterThanStartAt } = require('../utils/helpers');

async function getEvents(req, res){
    try {
        const events = await getAllEvents();

        if(!events || events.length === 0) {return res.status(404).json({ message: 'Events not found', data: null });}

        return res.status(200).json({ message: 'Events fetched successfully', data: events });

    } catch (err){
        logerror(err.message);
        return;
    }
}

async function getEvent(req, res){
    try{
        const event = await getOneEvent(req.params.id);
        
        if(!event) {return res.status(404).json({ message: 'Event not found', data: null });}

        return res.status(200).json({ message: 'Event fetched successfuly', data: event });
    }catch(err){
        logerror(err.message);
        return;
    }
}

//start for post
async function addEvent(req, res){
    try{

        const details = req.body;
        details.organiser = req.user.userId;
        const organiser = await getUserById(req.user.userId);
        details.organiser_name = organiser.username;

        // formatdatetme fields
        details.start_at = new Date(`${details.start_date} ${details.start_time}`);
        details.end_at = details.end_date ? new Date(`${details.end_date} ${details.end_time}`) : undefined;

        const currentDate = new Date();
        if (!isStartAtInPresent(details.start_at, currentDate)) {
            return res.status(400).json({ message: 'Event cannot be set in the past', data: null });
        }

        if (details.end_date && !isEndAtLaterThanStartAt(details.start_at, details.end_at)) {
            return res.status(400).json({ message: 'Event cannot be set to end earlier than when it starts', data: null });
        }

        const event = await addOneEvent(details);
        if(!event) {return res.status(500).json({ message: 'An error occurred while creating event', data: null });}

        res.status(201).json({ message: 'Event created successfully', data: event });
    }catch(err){
        logerror(err.message);
        return;
    }
}

//start for put
async function editEvent(req, res){
    try{     
        const organiser = await getUserById(req.user.userId);
        if(!organiser) {return res.status(404).json({ message: 'Organiser not found' });}

        const event = await getOneEvent(req.params.id);
        if(!event) {return res.status(404).json({ message: 'Event does not exist', data: null });}

        if(isEventPast(event.start_date, event.start_time)) {return res.status(403).json({message: "You can't edit past events", data: null})}

        if(event.organiser !== req.user.userId) {return res.status(403).json({message: "You can only edit events you created", data: null})}
       
        const editevent = await editOneEvent(req.params.id, req.body);
        console.log(editevent);
        return res.status(200).json({ message: 'Event edited successfully', data: editevent });
    }catch(err){
        logerror(err.message);
        return;
    }
}

//start for delete
async function deleteEvent(req, res){
    try{
        const event = await getOneEvent(req.params.id); 
        if(!event) {return res.status(404).json({ message: 'Event does not exist', data: null });}

        const organiser = await getUserById(req.user.userId);
        if(event.organiser !== organiser?.id) {return res.status(403).json({ message: 'Unauthorized, you can only delete event you created', data: null });}

        const deletedevent = await deleteOneEvent(req.params.id);
        if(!deletedevent) {return res.status(404).json({ message: 'Event not found', data: null });}

        return res.status(200).json({ message: 'Event deleted successfully', data: event });
        
    }catch(err){
        logerror(err.message);
        return;
    }
}

async function eventsByUser(req, res){
    try{
        const organiser = await getUserById(req.user.userId);
        if(!organiser) {return res.status(400).json({ message: 'No organiser found', data: null });}

        const userEvents = await getAllUserEvents(organiser._id);

        return res.status(200).json({
            data: userEvents
        });

    }catch(err){
        logerror(err.message);
        return;
    }
}

//end

function logerror(msg){
    logger.error('in /controllers/eventsController.js: '+msg);
}

module.exports = { getEvents, getEvent, eventsByUser, addEvent, editEvent, deleteEvent };