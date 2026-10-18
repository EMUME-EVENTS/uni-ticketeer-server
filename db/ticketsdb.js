const logger = require('../logger');
const Tickets = require('../models/Tickets');

async function getAllTickets(){
    try{
        const tickets = await Tickets.find()
        return tickets;
    }catch(err){
        logerror("getAllTickets: "+err.message)
    }
}

async function getAllTicketsByEventId(eventId){
    try{
        const tickets = await Tickets.find({ event_id: eventId });
        return tickets;
    }catch(err){
        logerror(err.message+" getAllTicketsByEventId");
        return;
    }
}

async function getOneTicket(ticketId){
    try{
        const ticket = await Tickets.findById(ticketId);
        return ticket;
    }catch(err){
        logerror(err.message+" getOneTicket");
        return;
    }
}

async function createNewTicket(body){
    try{
        const ticket = await new Tickets(body).save();
        return ticket;
    }catch(err){
        logerror(err.message+" createNewTicket");
        return;
    }
}

async function editOneTicket(id, body){
    try{
        await Tickets.findByIdAndUpdate(id, body);

        const ticket = await Tickets.findById(id);
        return ticket;

    }catch(err){
        logerror(err.message+" editOneTicket");
        return;
    }

}

async function deleteOneTicket(id){
    try{
        const ticket = await Tickets.findByIdAndDelete(id);
        return ticket;
    }catch(err){
        logerror(err.message+" deleteOneTicket");
        return;
    }
}

function logerror(msg){
    logger.error('in /ticketsdb.js: ' + msg);
}

module.exports = { getAllTickets, getAllTicketsByEventId, getOneTicket, createNewTicket, editOneTicket, deleteOneTicket };