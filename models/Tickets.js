const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    event_id: {
        type: String,
        required: true
    },
    organiser_id: {
        type: String,
        required: true
    },
    ticket_type: {
        type: String,
        required: true
    },
    ticket_price: {
        type: Number,
        required: true,
        default: 0
    },
    event_name: {
        type: String,
        required: true
    },
    ticket_banner_url: {
        type: String,
        required: true
    },
    ticket_quantity: {
        type: Number,
        default: undefined
    },
    quantity_sold: {
        type: Number,
        default: 0
    },
    restrictions: {
        age: { range: { type: String }, benchmark: { type: Number } },
        gender: { type: String }
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('Tickets', TicketSchema);