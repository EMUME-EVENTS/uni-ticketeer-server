const logger = require('../logger');
const SoldTickets = require('../models/SoldTickets');

async function getSoldTicketByTicketCode(ticketId){
    try{
        const soldticket = await SoldTickets.findOne({ ticket_id: ticketId });
        return soldticket;
    }catch(err){
        logerror(err.message);
        return;
    }
}

async function getAllSoldTicketsByUserId(userId){
    try{
        const soldTicket = await SoldTickets.find({'user_info.user_id': userId})
        return soldTicket;
    }catch(err){
        logerror(err.message)
        return
    }
}

async function getAllSoldTickets(){
    try{
        const soldTickets = await SoldTickets.find()
        return soldTickets
    }catch(err){
        logerror(err.message)
        return
    }
}

async function getAllSoldTicketsByOrganiserId(organiserId){
    try{
        const soldTickets = await SoldTickets.find({'ticket_info.organiser_id': organiserId})
        return soldTickets
    }catch(err){
        logerror(err.message)
        return
    }
}

async function addSoldTicket(body){
    try{
        const soldTicket = await new SoldTickets(body).save();
        return soldTicket;
    }catch(err){
        console.log(err || err.message)
        logerror(err.message);
        return;
    }
}

function logerror(msg){
    logger.error('in /db/soldticketsdb.js: ', msg);
}

module.exports = { 
    getSoldTicketByTicketCode, 
    getAllSoldTickets, 
    getAllSoldTicketsByOrganiserId, 
    getAllSoldTicketsByUserId, 
    addSoldTicket 
};