const { getOneEvent, editOneEvent } = require('../db/eventsdb');
const { getAllSoldTicketsByUserId } = require('../db/soldticketsdb');
const { getAllTicketsByEventId, getOneTicket, createNewTicket, editOneTicket, deleteOneTicket } = require('../db/ticketsdb');
const { getUserById } = require('../db/usersdb');

async function getTicketsByEventId(req, res){
    const tickets = await getAllTicketsByEventId(req.params.eventid);

    if(!tickets || tickets.length === 0) {return res.status(404).json({ message: 'Tickets for given event does not exist', data: null });}

    return res.status(200).json({ message: 'Tickets found', data: tickets });
}

async function getTicket(req, res){
    const ticket = await getOneTicket(req.params.id);
    if(!ticket) {return res.status(404).json({ message: 'Ticket not found', data: null });}

    return res.status(200).json({ message: 'Ticket found', data: ticket });
}

async function getPurchasedTickets(req, res){
    const tickets = await getAllSoldTicketsByUserId(req.user.userId);
    if(!tickets || tickets.length == 0){return res.status(404).json({message: 'No Tickets purchased yet', data: null})}

    return res.status(200).json({message: 'Tickets Found', data: tickets})
}

async function createTicket(req, res){
    const event = await getOneEvent(req.body.event_id);
    if(!event) {return res.status(404).json({ message: 'Event doesn\'t exist' });}
    if(req.user.userId !== String(event.organiser)) {return res.status(403).json({ message: 'You can only create tickets for your Events', data: null });}

    const tickets = await getAllTicketsByEventId(req.body.event_id);
    if(tickets && tickets.length > 0){
        const typeExists = tickets.find((ticket)=> ticket.ticket_type.toLowerCase() === req.body.ticket_type.toLowerCase());
        if(typeExists) {return res.status(403).json({ message: 'Ticket type already exists for this event', data: null });}
    }

    const eventName = event.title;
    const ticket = await createNewTicket({ eventName, ...req.body });
    if(!ticket) {return res.status(500).json({ message: 'An error occured while creating ticket', data: null });}

    let newTickets = await getAllTicketsByEventId(req.body.event_id)
    if(!newTickets || newTickets.length == 0) return res.status(500).json({message: "An Error occured while creating ticket"})

    let edited_event = await editOneEvent(event._id, {ticket_prices: newTickets.map((ticket)=>(ticket.ticket_price))})
    if(!edited_event) return res.status(500).json({message: "An Eror occured while creating ticket"})

    return res.status(201).json({
        message: 'Ticket created successfully',
        data: ticket
    });
}

async function editTicket(req, res){

    const event = await getOneEvent(req.body.event_id);
    if(!event) {return res.status(404).json({ message: 'Event doesn\'t exist' });}
    const organiser = await getUserById(req.user.userId);
    if(!organiser || (organiser.username !== event.organiser_name)) {
        return res.status(403).json({ message: 'You can only edit tickets for your Events', data: null });
    }

    //const tickets = await getAllTicketsByEventId(req.body.event_id);
    // if(tickets && tickets.length !== 0){
    //     tickets.forEach((ticket, index)=>{
    //         if(ticket.ticket_type === req.body.ticket_type) {return res.status(403).json({ message: 'Ticket type already exists for this event', data: null });}
    //     });
    // }

    const ticket = await editOneTicket(req.params.id, req.body);

    if(!ticket) {return res.status(500).json({ message: 'An error occured', data: null });}

    let newTickets = await getAllTicketsByEventId(req.body.event_id)
    if(!newTickets || newTickets.length == 0) return res.status(500).json({message: "An Error occured while editing ticket"})

    let edited_event = await editOneEvent(event._id, {ticket_prices: newTickets.map((ticket)=>(ticket.ticket_price))})
    if(!edited_event) return res.status(500).json({message: "An Eror occured while editing ticket"})

    return res.status(200).json({ message: 'Ticket edited successfully', data: ticket });
}

async function deleteTicket(req, res){

    const ticket = await getOneTicket(req.params.id)
    if(!ticket) { return res.status(404).json({message: 'Ticket does not exist'})}

    const event = await getOneEvent(ticket.event_id);
    if(!event) {return res.status(404).json({ message: 'Event doesn\'t exist' });}

    const organiser = await getUserById(req.user.userId);
    if(!organiser || organiser.username !== event.organiser_name) {return res.status(403).json({ message: 'You can only delete tickets for your Events', data: null });}

    const deletedTicket = await deleteOneTicket(req.params.id);
    if(!deletedTicket) {return res.status(500).json({ message: 'An error occured while trying to delete post', data: null });}

    return res.status(200).json({ message: 'Ticket deleted successfully', data: deletedTicket });
}

module.exports = { getTicketsByEventId , getPurchasedTickets, getTicket, createTicket, editTicket, deleteTicket };