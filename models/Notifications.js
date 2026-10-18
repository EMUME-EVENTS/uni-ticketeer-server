const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    viewed: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('notifications', NotificationSchema);