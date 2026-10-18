function calculateAdminAllTimeSalesAmount(ticketsSold){
    let total=0;
    if(!ticketsSold || ticketsSold.length == 0) return 0
    
    for(let i=0; i < ticketsSold.length; i++){
        total += ticketsSold[i].final_price
    }
    return total
}

function calculateAdminAllTimeTicketSales(ticketsSold){
    let total = 0
    for(let i=0; i < ticketsSold.length; i++){
        total += 1 * ticketsSold[i].quantity
    }

    return total
}

module.exports = {
    calculateAdminAllTimeSalesAmount,
    calculateAdminAllTimeTicketSales
}