const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    coupon_code: {
        type: String,
        required: true
    },
    coupon_name: {
        type: String,
        required: true
    },
    discount_type: {
        type: String,
        required: true
    },
    discount_amount: {
        type: String,
        required: true
    },
    use_times: {
        type: Number,
        default: 0
    },
    organiser_username: {
        type: String,
        required: true
    },
    restrictions: {
        valid_from: { type: Date, require: true },
        valid_to: { type: Date, required: true },
        max_usage: { type: Number },
        tickets_applied: { type: Array }
    }
});

module.exports = mongoose.model('Coupons', CouponSchema);