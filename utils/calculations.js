const { getSoldTicketByTicketCode } = require('../db/soldticketsdb');
const { nanoid } = require('nanoid');

async function generateTicketId(){
    const ticketId = nanoid(6);
  
    const checkticketid = await getSoldTicketByTicketCode(ticketId);
    if(checkticketid){
        generateTicketId();
    }else{
        return ticketId;
    }
}
  
function discountTicket(type, ticketPrice, discount){
    if(type === 'percentage'){
        const discountPrice = (ticketPrice * discount) / 100;
        const finalPrice = ticketPrice - discountPrice;
  
        return finalPrice;
    }
  
    if(type === 'price'){
        const finalPrice = ticketPrice - discount;
  
        return finalPrice;
    }
}

function calculateOrganiserCut(amount, percentage){
    const priceToDeduct = (amount * percentage) / 100;
    const organiserCut = amount - priceToDeduct;

    return organiserCut;
}

function calculateMinorCurrencyUnit(amount){
    return amount * 100
}

module.exports = { generateTicketId, discountTicket, calculateOrganiserCut, calculateMinorCurrencyUnit };