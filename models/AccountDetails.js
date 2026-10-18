const mongoose = require('mongoose');

const AccountDetailsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    account_number: {
        type: String,
        required: true
    },
    bank_code: {
        type: String,
        required: true
    },
    bank_name: {
        type: String,
        required: true
    },
    paystack_recipient_code: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('AccountDetails', AccountDetailsSchema);