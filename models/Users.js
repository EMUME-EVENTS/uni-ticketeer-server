const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    username: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    is_email_verified: {
        type: Boolean,
        default: false
    },
    profile_img:{
        type: String
    },
    phone_number: {
        type: String
    },
    dob: {
        type: Date
    },
    password: {
        type:String,
        required: true
    },
    gender: {
        type: String
    },
    usertype: {
        type: String,
        required: true
    },
    registered_at: {
        type: Date,
        default:  Date.now()
    },
    location: {
        type: Object,
        required: true
    },
    account: {
        balance: { type: Number, default: 0 },
        transactions: { type: Array }
    },
    last_logged_in: {
        type: Date
    },
    refered_by:{
        type: String
    },
    tac:{
        type: Boolean,
        required: true
    },
    mail_subscription:{
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: "active"
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
});

module.exports = mongoose.model('Users', UsersSchema);