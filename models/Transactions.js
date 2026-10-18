const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    ref: {
        type: String,
        required: true
    },
    organiser_id: {
        type: mongoose.SchemaTypes.ObjectId
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    customer: {
        email: { type: String, required: true },
        name: { type: String }
    },
    metadata: Object,
    cart_checked_out: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        default: 'incomplete'
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Transactions', TransactionSchema);