const mongoose = require('mongoose');

const SoldTicketsSchema = new mongoose.Schema({
    ticket_info: {
        type: Object,
        required: true
    },
    user_info: {
        user_id: { type: String, required: true },
        user_name: { type: String, required: true },
        user_email: { type: String, required: true }
    },
    all_users: {
        type: Array,
        required: true
    },
    ticket_id: {
        type: String,
        required: true
    },
    final_price: {
        type: Number,
        required: true
    },
    commission: {
        type: Number,
        required: true
    },
    checked_in: {
        type: Boolean,
        default: false
    },
    quantity: {
        type: Number,
        required: true
    },
    times_shared: {
        type: Number,
        default: 0
    },
    coupon_codes: {
        type: [String]
    },
    purchase_time: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('SoldTickets', SoldTicketsSchema);