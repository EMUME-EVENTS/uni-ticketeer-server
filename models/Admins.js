const mongoose = require("mongoose")

const AdminSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    admintype: {
        type: String,
        required: true,
        enum: ['superadmin', 'admin', 'supervisor']
    },
    roles: [{
        type: String,
        required: true,
        enum: ['create', 'read', 'edit', 'delete']
    }],
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "active",
        enum: ['active', 'disabled']
    },
    date_created: {
        type: Date,
        default: new Date(),
        immutable: true
    },
    last_logged_in: {
        type: Date
    }
},{
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
})

module.exports = mongoose.model("Admins", AdminSchema)