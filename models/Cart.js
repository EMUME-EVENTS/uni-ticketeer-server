const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    ticket_info: {
        type: Object,
        required: true
    },
    user_info: {
        user_id: { type: String, required: true },
        user_name: { type: String, required: true },
        user_email: { type: String, required: true }
    },
    final_price: {
        type: Number,
        required: true
    },
    codes_applied: [
        {
            code: String, 
            ticket_applied: String
        }
    ],
    quantity: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Cart', CartSchema);