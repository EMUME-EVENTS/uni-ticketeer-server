const { getAllTicketsByEventId } = require("../db/ticketsdb")

function isEventPast(start_at){
    if(new Date()  > new Date(start_at)){
        return true
    }

    console.log("date never pass")
    return false
}

function isEndAtLaterThanStartAt(startAt, endAt) {
    // Check if both inputs are valid Date objects
    if (!(startAt instanceof Date) || isNaN(startAt.getTime())) {
        throw new Error('Invalid startAt date');
    }

    if (!(endAt instanceof Date) || isNaN(endAt.getTime())) {
        throw new Error('Invalid endAt date');
    }

    // Compare the two dates
    return endAt > startAt;
}


function isStartAtInPresent(startAt, currentDate) {
    // Check if both inputs are valid Date objects
    if (!(startAt instanceof Date) || isNaN(startAt.getTime())) {
        throw new Error('Invalid startAt date');
    }

    if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
        throw new Error('Invalid currentDate date');
    }

    // Compare the two dates
    return startAt > currentDate;
}

async function calculateActiveTickets(ongoing_events){
    let total=0;
    if(!ongoing_events) return 0
    for(let i=0; i < ongoing_events.length; i++){
        let tickets = await getAllTicketsByEventId(ongoing_events[i]._id)
        if(tickets && tickets.length > 0){
            total += tickets.length
        }
    }
    return total
}

async function calculateAllTimeSalesAmount(ticketsSold){
    let total=0;
    if(!ticketsSold) return 0
    for(let i=0; i < ticketsSold.length; i++){
        total += ticketsSold[i].final_price
    }
    return total
}

function calculateAllTimeTicketSales(ticketsSold){
    let total = 0
    for(let i=0; i < ticketsSold.length; i++){
        total += 1 * ticketsSold[i].quantity
    }

    return total
}

function calculateOngoingTicketSales(ongoing_events, ticketsSold){
    let total = 0
    for(let i=0; i < ongoing_events.length; i++){
        for(let j=0; j < ticketsSold.length; j++){
            if(ticketsSold[j].ticket_info?.event_id == ongoing_events[i]._id){
                total += 1 * ticketsSold[j].quantity
            }
        }
    }
    
    return total
}

module.exports = { 
    isEventPast, 
    isEndAtLaterThanStartAt, 
    isStartAtInPresent, 
    calculateActiveTickets, 
    calculateAllTimeSalesAmount,
    calculateAllTimeTicketSales,
    calculateOngoingTicketSales,
}