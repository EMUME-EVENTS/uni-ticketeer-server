const logger = require('../logger');
const Coupons = require('../models/Coupons');

async function getCouponByCouponCode(couponcode){
    try{
        const coupon = await Coupons.findOne({ coupon_code: couponcode });
        return coupon;
    }catch(err){
        logerror(err.message);
    }
}

function logerror(msg){
    logger.error('in /db/couponsdb.js: ', msg);
}

module.exports = { getCouponByCouponCode };