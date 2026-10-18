const express = require('express');
const { getEvents, getEvent, eventsByUser, addEvent, editEvent, deleteEvent } = require('../controllers/eventsController');
const { isUserAuthenticated, isUserOrganiser } = require('../middlewares/auth');
const { eventUploadValidation, editEventValidation } = require('../middlewares/validations');
const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/organisers/me', isUserAuthenticated, isUserOrganiser, eventsByUser);

router.post('/', isUserAuthenticated, isUserOrganiser, eventUploadValidation, addEvent);

router.put('/:id', isUserAuthenticated, isUserOrganiser, editEventValidation, editEvent);

router.delete('/:id', isUserAuthenticated, isUserOrganiser, deleteEvent);

module.exports = router;