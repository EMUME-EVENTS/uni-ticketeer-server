const axios = require('axios');
const logger = require('../logger');

const { getUserBymail, getUserByUsername, editOneUser, getUserById } = require('../db/usersdb');
const { getCartByUserId, deleteOneItem } = require('../db/cartdb');
const { getOneEvent } = require('../db/eventsdb');
const { getOneTicket, editOneTicket } = require('../db/ticketsdb');
const { addSoldTicket } = require('../db/soldticketsdb');
const { addTransaction } = require('../db/transactionsdb')
const { calculateOrganiserCut, generateTicketId } = require('./calculations');
const { response } = require('express');
const { commission } = require('./constants');

async function getPaymentLink(details){
    try{
        const response = await axios.post('https://api.paystack.co/transaction/initialize', 
            details
            ,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization':  `Bearer ${process.env.PAYSTACK_SECRET_KEY}` 
                }
            });
        
        console.log(response.data);
        
        return response.data.data.authorization_url;
    }catch(err){
        console.log(err)
        logerror(err || err.message);
    }
}

async function settlePlannersAndEmptyCart(usermail){
    try{
        const user = await getUserBymail(usermail);
        const cart = await getCartByUserId(user._id);

        console.log("user", user)
        console.log("cart", cart)
    
        for(let i = 0; i < cart.length; i++){
            //get event organiser
            const event = await getOneEvent(cart[i].ticket_info.event_id);
            let organiser = await getUserById(event.organiser);
            console.log("event", event)
            console.log("organiser", organiser)
      
            //edit organiser account balance and transactions
            const organiserCut = calculateOrganiserCut(cart[i].final_price, commission);
            organiser = await editOneUser(organiser._id, { account: {
                balance: organiser.account.balance + organiserCut
            } });

            const transaction = await addTransaction({
                ref: `${organiser.username}_user_checkout_${Date.now()}`,
                organiser_id: organiser._id,
                type: 'settlement', 
                amount: organiserCut, 
                customer: {
                    email: organiser.email,
                    name: organiser.username
                },
                metadata: {
                    event_name: cart[i].ticket_info?.event_name,
                    ticket_type: cart[i].ticket_info?.ticket_type,
                    ticket_price: cart[i].ticket_info?.ticket_price,
                    quantity: cart[i].quantity,
                    commission,
                    final_price: cart[i].final_price,
                    purchased_by: {
                        email: user.email,
                        name: user.username
                    }
                },
                currency: "NGN",
                status: 'completed',
                created_at: Date.now() 
            })
    
      
            //get ticket 
            const ticket = await getOneTicket(cart[i].ticket_info._id);
            console.log("ticket", ticket)
      
            //edit amount of tickets sold
            const editTicket = await editOneTicket(cart[i].ticket_info._id, { quantity_sold: ticket.quantity_sold + cart[i].quantity });
            if(!editTicket) {return 'error';}
      
            let ticketId = await generateTicketId()
            const soldTicket = await addSoldTicket({
                ticket_info: cart[i].ticket_info,
                user_info: cart[i].user_info,
                ticket_id: ticketId,
                commission: commission,
                quantity: cart[i].quantity,
                all_users: [cart[i].ticket_info],
                final_price: cart[i].final_price
            });

            if(!soldTicket) {return 'error';}
      
            //delete ticket from cart
            await deleteOneItem(cart[i]._id);
        }
    }catch(err){
        console.log(err)
        logerror(err || err.message)
    }
}

async function verifyTransaction(trxref){
    try{
        let response = await axios.get(`https://api.paystack.co/transaction/verify/${trxref}`,{
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })
        
        return response
    }catch(err){
        console.log(err.data, err.message, err.response.data)
        logerror(err || err.message);
    }
}

async function verifyAccountDetails(accountNumber, bankCode){
    console.log("account details to verify", accountNumber, bankCode)
    try{
        const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })
        //console.log("response", response.data)
        return response.data.data
    }catch(err){
        console.log(err)
        logerror(err || err.message);
    }
}

async function addPaystackRecipient(details){
    console.log("details to add as recipient", details)
    try{
        const response = await axios.post(`https://api.paystack.co/transferrecipient`, details, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })

        console.log("response from creating recipient", response?.data)
        return response?.data?.data
    }catch(err){
        console.log(err)
        logerror(err || err?.message);
    }
}

async function withdrawPlannersFunds(transferDets){
    console.log('details for transfer', transferDets)
    try{
        const response = await axios.post('https://api.paystack.co/transfer', transferDets,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization':  `Bearer ${process.env.PAYSTACK_SECRET_KEY}` 
                }
            });
        
        console.log(response.data);
        
        return response.data;
    }catch(err){
        console.log(err.data, err.message, err.response.data)
        logerror(err || err.message);
    }
}

function logerror(msg){
    logger.error('in /utils/paymentLogic :', msg);
}

module.exports = { 
    getPaymentLink, 
    settlePlannersAndEmptyCart, 
    verifyAccountDetails,
    verifyTransaction,
    addPaystackRecipient,
    withdrawPlannersFunds 
};