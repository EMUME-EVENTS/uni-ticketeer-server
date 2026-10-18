const { addOneItem, getCartByUserId, deleteOneItem, getOneCartItem } = require('../db/cartdb');
const { getOneEvent } = require('../db/eventsdb');
const { getOneTicket } = require('../db/ticketsdb');
const { addTransaction } = require('../db/transactionsdb');
const { generateTicketId } = require('../utils/calculations');
const { isEventPast } = require('../utils/helpers');
const { getPaymentLink } = require('../utils/paymentLogic');

async function addToCart(req, res){
    const quantity  = req.body.quantity;
    console.log('quantity', quantity);
    //checking if event is past
    let event = await getOneEvent(req.body.ticket_info.event_id)
    if(isEventPast(event.start_at)){
        return res.status(403).json({message: "This Event is Past", data: null})
    }

    //checking amount of tickets left
    const ticket = await getOneTicket(req.body.ticket_info._id);
    if(!ticket) {return res.status(404).json({ message: 'Ticket not found', data: null });}

    if(ticket.ticket_quantity){
        const ticketsLeft = ticket.ticket_quantity - ticket.quantity_sold;
        if(ticketsLeft == 0) {return res.status(400).json({ message: 'Ticket is sold out', data: null });}
        if(quantity > ticketsLeft) {return res.status(400).json({ message: 'Ticket quantity has exceeded ticket limit', data: null });}
    }

    const cartItem = {
        ticket_info: req.body.ticket_info,
        user_info: req.body.user_info,
        final_price: ticket.ticket_price * quantity,
        quantity: quantity
    }
    
    await addOneItem(cartItem);

    const cart = await getCartByUserId(req.user.userId);
    console.log(cart);
    if(!cart || cart.length < 1) {return res.status(404).json({ message: 'Cart not available', data: null });}

    return res.status(201).json({ message: 'Cart items added successfully', data: cart });
}

async function checkOutCart(req, res){
    console.log(req.body);
    let cartItems = await getCartByUserId(req.user.userId);
    let totalPrice = 0; 

    if(!cartItems || cartItems.length == 0) return res.status(400).json({message: "cart unavailable", data: null})

    //checking if number of same tickets in cart are larger than number of tickets remaining, if any.
    cartItems.forEach(async(item, i)=>{
        const ticket = await getOneTicket(item.ticket_info._id); 
        const remainingTickets = ticket.ticket_quantity - ticket.quantity_sold;

        if(remainingTickets == 0){
            return res.status(400).json({ message: `Tickets for ${item.ticket_info.event_name} has been sold out`, data: null });
        }
    });

    //calculate total price
    cartItems.forEach(item => {
        totalPrice += item.final_price;
    });

    console.log('logging req origin', req.get('Origin'))
    //process payment and get link
    const transactionRef = `${cartItems[0].user_info.user_name}_checkout_tx_${Date.now()}`;
    const details =  {
        reference: transactionRef,
        email: cartItems[0].user_info.user_email,
        amount: totalPrice * 100, //multiplying by hundred to account for paystacks use of kobo
        currency: 'NGN',
        callback_url: req.body.callback_url //`${process.env.FRONTEND_HOST}verifypayment`, //${req.protocol}://${req.get('host')}/dashboard/verifypayment
    };
    const link = await getPaymentLink(details);
    console.log("link", link)
    //if link not generated
    if(typeof link !== 'string') {return res.status(500).json({ message: 'An error occured, try again', data: null });}

    //if link generated, add to transaction
    await addTransaction({
        ref: transactionRef,
        amount: totalPrice,
        currency: 'NGN',
        type: 'checkout',
        customer: {
            email: cartItems[0].user_info.user_email,
            name: cartItems[0].user_info.user_name
        },
        cart_checked_out: cartItems
    });

    return res.status(200).json({ message: 'Checkout link generated', data: link });
}

async function getUserCart(req, res){
    let cart = await getCartByUserId(req.params.userid);
    if(!cart || cart.length < 1) {return res.status(404).json({ message: 'Cart not available', data: null });}

    let ticketsWithSameEventPsuedo;

    //checking if number of same tickets in cart are larger than number of tickets remaining, if any.
    cart.forEach(async(item, i)=>{
        const ticket = await getOneTicket(item.ticket_info._id); 
        const remainingTickets = ticket.ticket_quantity - ticket.quantity_sold;

        const ticketsWithSameEvent = cart.filter((cartTicket)=>{
            return cartTicket.ticket_info._id === item.ticket_info._id;
        });

        ticketsWithSameEventPsuedo = ticketsWithSameEvent.length;

        if(ticketsWithSameEventPsuedo > remainingTickets){
            await deleteOneItem(item._id);
            ticketsWithSameEventPsuedo--;
        }
    });

    cart = await getCartByUserId(req.params.userid);

    console.log(cart.length);
    return res.status(200).json({ message: 'Cart fetched successfully', data: cart });
}

async function deleteCartItem(req, res){
    const cartItem = await getOneCartItem(req.params.itemid)
    if(!cartItem) return res.status(404).json({message: 'Item not found in cart', data: null})
    
    if(cartItem.user_info?.user_id !== req.user.userId) return res.status(403).json({message: "You can only remove items in your cart", data: null})

    const item = await deleteOneItem(req.params.itemid);
    if(!item) {return res.status(404).json({ message: 'Item not found in cart', data: null });}

    return res.status(200).json({ message: 'Item deleted successfuflly', data: item });
}

module.exports = { addToCart, getUserCart, checkOutCart, deleteCartItem };