const logger = require('../logger');
const Events = require('../models/Events');

async function getOrganizerEventsIds(organiser) {
    try {
        const organizerEvents = await Events.find({ organiser: organiser }, '_id');
        const eventIds = organizerEvents.map(event => event._id);
        return eventIds;
    } catch (err) {
        logerror(err.message);
        return;
    }
}

async function getActiveEventsWithTickets(organiser, currentDate) {
    try {
        const activeEventsWithTickets = await Events.find({
            organiser: organiser,
            is_ticketed: true,
            start_at: { $gte: currentDate }
        }, '_id');
        const activeEventIds = activeEventsWithTickets.map(event => event._id);
        return activeEventIds;
    } catch (err) {
        logerror(err.message);
        return;
    }
}

function logerror(msg){
    logger.error('in db/dashboardAnalytics.js :'+ ' ' + msg);
}

module.exports = { getOrganizerEventsIds, getActiveEventsWithTickets };