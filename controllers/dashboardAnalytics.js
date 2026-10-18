const Events = require('../models/Events');
const Tickets = require('../models/Tickets');
const { getOrganizerEventsIds, getActiveEventsWithTickets } = require('../db/dashboardAnalytics');
const logger = require('../logger');

async function getDashboardAnalytics(req, res) {
    try {
        const organiser = req.user.userId;
        const currentDate = new Date();

        // Get active events (events held later today or on future dates)
        const activeEvents = await Events.countDocuments({
            organiser: organiser,
            start_at: { $gte: currentDate }
        });

        // Get all events by the organizer
        const allTimeEvents = await Events.countDocuments({
            organiser: organiser
        });

        // Get all event IDs for this organizer
        const eventIds = await getOrganizerEventsIds(organiser);

        // Get active tickets (tickets for events held later today or on future dates)
        const activeEventIds = await getActiveEventsWithTickets(organiser, currentDate);

        // Calculate total quantity sold for all events
        // This is done by matching all tickets with the event IDs of the organizer
        // And then summing up the quantity_sold field
        // We only want to show number of tickets organisers were able to sell
        const activeTickets = await Tickets.aggregate([
            {
                $match: {
                    event_id: {
                        $in: activeEventIds
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$quantity_sold' }
                }
            }
        ]);

        // Calculate total quantity sold for all events
        const allTimeTickets = await Tickets.aggregate([
            {
                $match: {
                    event_id: {
                        $in: eventIds
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$quantity_sold' }
                }
            }
        ]);

        const analytics = {
            active_events: activeEvents,
            active_tickets: activeTickets[0]?.total || 0,
            all_time_events: allTimeEvents,
            all_time_tickets: allTimeTickets[0]?.total || 0
        };

        return res.status(200).json({
            message: 'Dashboard analytics fetched successfully',
            data: analytics
        });

    } catch (err) {
        logerror(err.message);
        return res.status(500).json({
            message: 'Error fetching dashboard analytics',
            data: null
        });
    }
}
function logerror(msg) {
    logger.error('in /controllers/dashboardAnalytics.js: ' + msg);
}

module.exports = { getDashboardAnalytics };
