const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { getAdminByMail, editAdmin, getAdminById } = require("../db/admindb");
const logger = require("../logger");
const { getAllUsers } = require("../db/usersdb");
const { getAllTickets } = require("../db/ticketsdb");
const { getAllEvents } = require("../db/eventsdb");
const { getAllSoldTickets } = require("../db/soldticketsdb");
const { getAllWaitlist } = require("../db/waitlistdb");
const { calculateAdminAllTimeSalesAmount, calculateAdminAllTimeTicketSales } = require("../utils/admin-helpers");

async function authenticateAdmin(req, res){
    try{
        const admin = await getAdminByMail(req.body.email);

        if(!admin) {return res.status(400).json({ message: 'Admin account does not exist', data: null });}
    
        const isPasswordMatch = await bcrypt.compare(req.body.password, admin.password);

        if(!isPasswordMatch) {return res.status(401).json({ message: 'Password is incorrect', data: null });}

        let editedAdmin = await editAdmin(admin._id, {last_logged_in: new Date()})

        const token = jwt.sign({ userId: admin.id, email: admin.email, roles: admin.roles }, process.env.ADMIN_AUTH_TOKEN_SECRET, { expiresIn: '24h' });

    
        return res.status(200).json({ message: 'Logged in successfully', data:{ user: editedAdmin, token: token } });

    } catch(err){
        logError(err.message);
        return res.status(500).json({message: 'An error occured', data: null});
    }
}

async function createAdminAccount(req, res){

}

async function getOverview(req, res){
    // total number of users, total number of tickets, total number of events, waitinglist users,
    let allUsers = await getAllUsers()
    let allTickets = await getAllTickets()
    let allEvents = await getAllEvents()
    let allTicketsSold = await getAllSoldTickets()
    let waitinglist = await getAllWaitlist()

    let totalUsers = allUsers.length
    let totalTickets = allTickets.length
    let totalEvents = allEvents.length
    let totalTicketsSold = calculateAdminAllTimeTicketSales(allTicketsSold)
    let waitinglistEmails = waitinglist.length
    let ticketRevenue = calculateAdminAllTimeSalesAmount(allTicketsSold)

    let body = {
        totalUsers,
        totalTickets,
        totalEvents,
        totalTicketsSold,
        waitinglistEmails,
        ticketRevenue,
        users: allUsers,
        tickets: allTickets,
        events: allEvents,
        ticketsSold: allTicketsSold,
        waitinglist
    }

    return res.status(200).json({message: "Overview fetched", body})

}

async function getAdminProfile(req, res){
    let admin = await getAdminById(req.admin.userId)
    if(!admin) return res.status(404).json({message: "Admin not found", data: null})

    return res.status(200).json({message: "Admin profile fetched", data: admin})
}

function logError(msg){
    logger.error('in /controllers/adminController.js: ' + msg)
}

module.exports = {
    authenticateAdmin,
    getOverview,
    createAdminAccount,
    getAdminProfile
}