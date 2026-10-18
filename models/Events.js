const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String
    },
    // Combined date and time fields
    start_at: {
        type: Date,
    },
    end_at: {
        type: Date,
    },
    category: {
        type: Array,
        required: true
    },
    organiser: {
        type: String,
        required: true
    },
    organiser_name: {
        type: String,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    banner_image_url: {
        type: String,
        required: true
    },
    additional_information: {
        type: String
    },
    promo_code: {
        type: String
    },
    is_ticketed: {
        type: Boolean,
        required: true,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        required: true,
        default: new Date(),
        immutable: true
    },
    ticket_prices: {
        type: Array
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled'],
        default: 'draft'
    }
});

module.exports = mongoose.model('Events', EventSchema);