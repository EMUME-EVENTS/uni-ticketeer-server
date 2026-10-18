const express = require('express');
const { getTicketsByEventId, getTicket, createTicket, editTicket, deleteTicket, getPurchasedTickets } = require('../controllers/ticketsController'); 
const { isUserAuthenticated, isUserOrganiser } = require('../middlewares/auth');
const { createTicketValidation, addToCartValidation, editTicketValidation } = require('../middlewares/validations');
const { checkAndProcessTicket, processAndGenerateTicket } = require('../middlewares/process');
const { addToCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/events/:eventid', getTicketsByEventId);
router.get('/:id', isUserAuthenticated, getTicket);
router.get('/purchased/user', isUserAuthenticated, getPurchasedTickets)

router.post('/', isUserAuthenticated, isUserOrganiser, createTicketValidation, createTicket);
router.post('/generate/:id',  isUserAuthenticated,  addToCartValidation, checkAndProcessTicket, processAndGenerateTicket, addToCart);

router.put('/:id', isUserAuthenticated, isUserOrganiser, editTicketValidation, editTicket);

router.delete('/:id', isUserAuthenticated, isUserOrganiser, deleteTicket);

module.exports = router;