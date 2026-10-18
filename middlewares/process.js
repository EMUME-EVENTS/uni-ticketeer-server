const { default: axios } = require('axios');
const { getOneAccountByUserId } = require('../db/accountdetailsdb');
const { getCouponByCouponCode } = require('../db/couponsdb');
const { getOneTicket } = require('../db/ticketsdb');
const { getUserById, getUserBymail } = require('../db/usersdb');
const { discountTicket } = require('../utils/calculations');
const logger = require('../logger');

async function checkAndProcessTicket(req, res, next){
    console.log("in check and process ticket middleware", req.params.id, req["Symbol(kHeaders)"])
    const ticket = await getOneTicket(req.params.id);
    if(!ticket) {return res.status(404).json({ message: 'Ticket not found', data: null });}
    const user = await getUserById(req.user.userId);
    if(!user) {return res.status(404).json({ message: 'User does not exist', data: null });}

    //checking if ticket is still available
    if(ticket.ticket_quantity && ticket.quantity_sold === ticket.ticket_quantity){
        return res.status(404).json({ message: 'This ticket is sold out', data: null });
    }

    console.log("logging restriction for show", ticket.restrictions)

    //checking age eligibility
    if(ticket.restrictions?.age?.range){
        if(!user.dob){
            return res.status(403).json({ message: 'This ticket has age restrictions, set your \'date of birth\' ', data: null });
        }
        const userage = new Date().getFullYear() - new Date(user.dob).getFullYear();
        
        if(ticket.restrictions?.age?.range === 'over'){
            if(userage > ticket.restrictions?.age?.benchmark){
                return res.status(403).json({ message: 'You are older than the required age', data: null });
            }
        }else if(ticket.restrictions?.age?.range === 'under'){
            if(userage < ticket.restrictions?.age?.benchmark){
                return res.status(403).json({ message: 'You are younger than the required age', data: null });
            }
        }
    }

    //checking gender eligibility
    if(ticket.restrictions?.gender){
        if(!user.gender){
            return res.status(403).json({message: "This ticket has gender restrictions, set your gender", data: null})
        }

        const usergender = user.gender;
        if(ticket.restrictions?.gender === usergender){
            return res.status(403).json({ message: 'Ticket is not available for your gender' });
        }
    }

    req.body.ticket_info = ticket
    req.body.user_info = {
        user_id: user._id,
        user_name: user.username,
        user_email: user.email
    }

    next();
}

async function processAndGenerateTicket(req, res, next){
    console.log(req.body);
    const ticket = await getOneTicket(req.params.id);
    if(!ticket) {return res.status(404).json({ message: 'Ticket not found', data: null });}

    if(ticket.coupon_codes && ticket.coupon_codes.length > 0){
        ticket.coupon_codes.forEach(async (couponcode, index)=>{
            const coupon = await getCouponByCouponCode(couponcode);
            if(!coupon) {return res.status(404).json({ message: 'coupon '+ couponcode + ' does not exist, remove and continue', data: null });}

            if(coupon.restrictions.valid_to < Date.now()) {return res.status(403).json({ message: 'coupon ' + couponcode + ' has expired, remove code to continue', data: null });}
            if(coupon.restrictions.valid_from > Date.now()) {return res.status(403).json({ message: 'promo for coupon '+couponcode + ' has not started, remove code to proceed', data: null });}
            if(coupon.use_times === coupon.restrictions.max_usage) {return res.status(403).json({ message: 'Coupon '+ couponcode + ' has reached the maximum usage, please remove it', data: null });}
            if(coupon.discount_type === 'percentage' && coupon.discount_amount > 100) {return res.status(403).json({ message: 'Percentage discount can\'t be more than 100%', data: null });}
            if(coupon.discount_type === 'price' && coupon.discount_amount > ticket.ticket_price) {return res.status(403).json({ message: 'Discount price is bigger than ticket price', data: null });}

            const isTicketApplied = coupon.restrictions.tickets_applied.find((ticketid)=> ticketid === ticket._id);

            if(!isTicketApplied) {return res.status(403).json({ message: 'Coupon '+couponcode+' cannot be applied to this ticket, please remove it', data: null });}

            const finalPrice = discountTicket(coupon.discount_type, ticket.ticket_price, coupon.discount_amount);

            req.body.final_price = finalPrice;

        });
    } else {
        console.log('coupon doesnt exist');
        req.body.final_price = ticket.ticket_price;
    }

    next();
}

async function processWithdrawal(req, res, next){
    console.log(req.body);
    const user = await getUserById(req.user.userId);
    if(!user) {return res.status(404).json({ message: 'User not found', data: null });}
    const accountdetails = await getOneAccountByUserId(req.user.userId);
    if(!accountdetails) {return res.status(400).json({ message: 'No account details found', data: null });}
  
    if(user.account.balance < req.body.amount) {return res.status(400).json({ message: 'You don\'t have sufficient funds for this withdrawal', data: null });}
  
    next();
}

async function processCreatePaystackTransferRecepient(req, res, next){
    let body = req.body
    let user = await getUserById(body.user_id)

    if(!user) return res.status(400).json({message: "User not found", data: null})

    let payload = {
        type: "nuban",
        name: `${user.firstname} ${user.lastname}`,
        account_number: body.account_number,
        bank_code: body.bank_code,
        currency: "NGN"
    }

    try{
        //verify user bank account details
        let verifRes = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${body.account_number}&bank_code=${body.bank_code}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })
        console.log("response from verifying user account details", verifRes)
        if(verifRes.data.status !== true) return res.status(400).json({message: verifRes.data.message, data: null})

        //after successfull verification go ahead to create a recipient with paystack
        let res = await axios.post("https://api.paystack.co/transferrecipient", payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })
        console.log("response from creating paystack recepient", res)
        if(res.data.status != true) return res.status(500).json({message: res.data.message, data: null})

        req.body = {
            ...req.body,
            recipient_code: res.data.data.recipient_code
        }

        next()
    }catch(err){
        logger.error(err?.response?.data?.message || err?.response?.message || err?.message || err)
        return res.status(500).json({message: "An internal error occured", data: null})
    }
}

module.exports = { checkAndProcessTicket, processAndGenerateTicket, processWithdrawal };