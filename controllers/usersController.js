const { getOneAccountByUserId, editOneAccountByUserId, createAccountDetails } = require('../db/accountdetailsdb');
const { getTransactionsByUserId, addTransaction } = require('../db/transactionsdb');
const { getUserById, getUserBymail, getUserByUsername, addNewUser, editOneUser } = require('../db/usersdb');
const { findTokenByUserId, createToken, deleteTokenByUserId } = require('../db/verificationtokensdb');
const { withdrawPlannersFunds, verifyAccountDetails, addPaystackRecipient } = require('../utils/paymentLogic')
const bcrypt = require("bcryptjs")
const crypto = require("crypto");
const { sendMailVerificationLink, sendForgotPasswordLinkMail } = require('../utils/mails');
const { getAllUserEvents } = require('../db/eventsdb');
const { isEventPast, calculateActiveTickets, calculateAllTimeSalesAmount, calculateOngoingTicketSales, calculateAllTimeTicketSales } = require('../utils/helpers');
const { getAllSoldTicketsByOrganiserId } = require('../db/soldticketsdb');
const { calculateMinorCurrencyUnit } = require('../utils/calculations');

//get single user or user profile
async function getUser(req, res){
    const user = await getUserById(req.user.userId);

    if(!user) {return res.status(404).json({ message: 'User not found', data: null });}
    user.password = undefined;

    return res.status(200).json({ message: 'User loaded successfully', data: user });
}

async function getOrganiserStats(req, res){
    let organiserid = req.user.userId

    let ongoingEvents;
    let ongoingTicketSales;
    let allTimeEvents;
    let allTimeTicketSales;
    let activeTickets;
    let allTimeSales;

    let events = await getAllUserEvents(organiserid)
    let ticketsSold = await getAllSoldTicketsByOrganiserId(organiserid)
    console.log("tickets sold before calculation", ticketsSold)

    let ongoing_events = events?.filter((event)=>!isEventPast(event.start_at))

    ongoingEvents = ongoing_events.length,
    ongoingTicketSales = calculateOngoingTicketSales(ongoing_events, ticketsSold),
    allTimeEvents = events.length,
    allTimeTicketSales = calculateAllTimeTicketSales(ticketsSold),
    activeTickets = await calculateActiveTickets(ongoing_events),
    allTimeSales = await calculateAllTimeSalesAmount(ticketsSold)

    let response_payload = {
        ongoingEvents,
        ongoingTicketSales,
        allTimeEvents,
        allTimeTicketSales,
        activeTickets,
        allTimeSales
    }

    console.log("dashboard stats", response_payload)

    return res.status(200).json({message: "Stats Fetched", data: response_payload})
}

// create user
async function createUser(req, res) {
    try {
        const details = req.body;

        // Check existing user
        const [existingEmail, existingUsername] = await Promise.all([
            getUserBymail(details.email),
            getUserByUsername(details.username)
        ]);

        //ensure details contain first and last names for organiser
        if(details.usertype == "organiser" && (!details.firstname && !details.lastname)){
            return res.status(400).json({
                message: "firstname and lastname required",
                data: null
            })
        }

        if (existingEmail) {
            return res.status(409).json({
                message: 'User with this email already exists',
                data: null
            });
        }

        if (existingUsername) {
            return res.status(409).json({
                message: 'Username is already taken',
                data: null
            });
        }

        // Validate terms and conditions
        if (!details.tac) {
            return res.status(400).json({
                message: 'You must accept the terms and conditions to register',
                data: null
            });
        }

        // Prepare user data
        const userData = {
            ...details,
            location: {
                country: details.location,
                state: ''
            }
        };

        // Add account details for organiser
        if (details.usertype === 'organiser') {
            userData.account = {
                balance: 0,
                transactions: []
            };
        }

        // Create user
        const newUser = await addNewUser(userData);
        if (!newUser) {
            return res.status(500).json({
                message: 'Failed to create user',
                data: null
            });
        }

        let token = await createToken({
            user_id: newUser._id,
            token: crypto.randomBytes(32).toString('hex')
        })

        await sendMailVerificationLink(details.email, newUser._id, token.token)

        return res.status(201).json({
            message: 'User created successfully',
            data: newUser
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            message: 'An internal server error occurred',
            data: null
        });
    }
}

//edit user
async function editUser(req, res){
    const user = await editOneUser(req.user.userId, req.body);
    if(!user) {return res.status(404).json({ message: 'User not found', data: null });}

    return res.status(200).json({ message: 'User edited successfully', data: user });
}

//withdraw funds
async function withdrawOrganiserfunds(req, res){
    try{
        console.log(req.body);
        const user = await getUserById(req.user.userId);
        if(!user) {return res.status(400).json({ message: 'User not found', data: null });}
    
        const accountInfo = await getOneAccountByUserId(req.user.userId);
        if(!accountInfo) {return  res.status(400).json({ message: 'No account details found', data: null });}
    
        const transactionRef = `${user.username.replace(" ", "_")}_withdrawal_tx_${Date.now()}`;
        const paymentDetails = {
            source: 'balance',
            amount: calculateMinorCurrencyUnit(req.body.amount),
            recipient: accountInfo.paystack_recipient_code,
            reason: 'Withdrawal transaction',
            currency: 'NGN',
            reference: transactionRef
        };
    
        const withdrawalResponse = await withdrawPlannersFunds(paymentDetails);
        console.log(withdrawalResponse);
    
        if(withdrawalResponse?.status === true) {
    
            let transactionDetails = {
                type: 'withdrawal',
                ref: transactionRef,
                organiser_id: user._id,
                amount: req.body.amount,
                currency: 'NGN',
                status: 'pending',
                cart_checked_out: [],
                created_at: new Date(),
                customer: {
                    email: user.email,
                    name: user.username
                }
            }
    
            await addTransaction(transactionDetails)
    
            return res.status(200).json({ message: withdrawalResponse.message, data: withdrawalResponse });
        }

    }catch(err){
        console.error('Error withdrawing funds:', err);
        return res.status(500).json({ message: 'An error occured', data: null });
    }
}

async function addAccountDetails(req, res){
    console.log('account details', req.user);
    let user = await getUserById(req.user.userId)
    let userDetails = await getOneAccountByUserId(req.user.userId);
    if(userDetails) {return res.status(400).json({ message: 'Account Details already added', data: null });}

    //verify account details and match with name
    let data = await verifyAccountDetails(req.body.account_number, req.body.bank_code)

    console.log("data", data)
    
    //if it doesn't match
    if(!data?.account_name?.toLowerCase().includes(user?.firstname.toLowerCase()) || !data?.account_name?.toLowerCase().includes(user.lastname.toLowerCase())){
        console.log("e no match", data.account_name.toLowerCase(), user.firstname)
        return res.status(400).json({message: "Name on Bank account doesn't match account name", data: null})
    }
    
    //if it matches
    console.log("e match", data.account_name.toLowerCase(), user.firstname.toLowerCase())
    //create a paystack recipient
    let recipientDetails = {
        type: "nuban",
        name: user?.firstname + " " + user?.lastname,
        account_number: req.body.account_number,
        bank_code: req.body.bank_code
    }
    let recipient = await addPaystackRecipient(recipientDetails)

    req.body.paystack_recipient_code = recipient.recipient_code
    
    userDetails = await createAccountDetails(req.body);
    if(!userDetails) return res.status(500).json({message: "An error occured", data: null})
    
    return res.status(201).json({ message: 'Account details added', data: userDetails });


}

async function getAccountDetails(req, res){
    const userDetails = await getOneAccountByUserId(req.user.userId);
    if(!userDetails) {return res.status(404).json({ message: 'Account detials not found', data: null });}

    return res.status(200).json({ message: 'Account detials fetched successfully', data: userDetails });
}

async function editAccountDetails(req, res){
    const userDetails = await editOneAccountByUserId(req.user.userId, req.body);
    if(!userDetails)  {return res.status(404).json({ message: 'User not found', data: null });}

    return res.status(200).json({ message: 'Account details edited successfully', data: userDetails });
}

async function getTransactionHistory(req, res){
    const transactionHistory = await getTransactionsByUserId(req.user.userId)
    if(!transactionHistory) return res.status(404).json({message: "No transaction history found", data: null})
    
    return res.status(200).json({message: "Transaction history fetched successfully", data: transactionHistory})
}

async function editUserPassword(req, res){
    let user = await getUserById(req.user.userId)

    if(!user) return res.status(400).json({message: "User does not exist", data: null})
    
    let isPasswordMatch = await bcrypt.compare(req.body.old_password, user.password)

    if(!isPasswordMatch) return res.status(401).json({message: "Password is incorrect", data: null})

    if(req.body.new_password !== req.body.confirm_new_password) return res.status(400).json({message: "new password and confirmation don't match", data: null})

    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(newuser.password, salt)

    let userEdit = await editOneUser(req.user.userId, {password: hash})
    if(!userEdit) return res.status(404).json({message: "User not found", data: null})
    userEdit.password = undefined

    return res.status(201).json({message: "Password changed successfully", data: userEdit})
    
}

async function sendForgotPasswordLink(req, res){
    let user = await getUserBymail(req.query.email)
    if(!user) return res.status(400).json({message: "Email not found in database", data: null})

    let token = await createToken({
        user_id: user._id,
        token: crypto.randomBytes(32).toString('hex')
    })

    if(!token) return res.status(500).json({message: "An error occured, try again", data: null})

    await sendForgotPasswordLinkMail(req.query.email, user._id, token.token)

    return res.status(200).json({message: "Reset password link has been sent to your mail"})
}

async function resetUserPassword(req, res){
    let token = req.query.token
    let userid = req.query.userid
    let new_password = req.body.new_password

    let user = await getUserById(userid)
    if(!user) return res.status(400).json({message: "User not found", data: null})

    let Token = await findTokenByUserId(userid)
    if(!Token) return res.status(400).json({message: "Missing or Expired Token", data: null})

    console.log("token comparison, token sent:", token, "token to check against", Token.token)
    if(Token.token !== token) {
        let deletedToken = await deleteTokenByUserId(userid)
        if(!deletedToken) return res.status(500).json({message: "An unknown error occured", data: null})
        
        return res.status(400).json({message: "Invalid Token", data: null})
    }

    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(new_password, salt)

    let userEdit = await editOneUser(userid, {password: hash})
    if(!userEdit) return res.status(404).json({message: "User not found", data: null})
    userEdit.password = undefined

    await deleteTokenByUserId(userid)

    return res.status(201).json({message: "Password changed successfully", data: userEdit})
}



module.exports = {
    createUser, 
    getUser,
    getOrganiserStats,
    getTransactionHistory,
    editUser, 
    withdrawOrganiserfunds, 
    addAccountDetails, 
    getAccountDetails, 
    editAccountDetails,
    editUserPassword,
    sendForgotPasswordLink,
    resetUserPassword
}