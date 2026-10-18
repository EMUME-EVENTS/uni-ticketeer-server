let mongoose = require("mongoose")

const WaitlistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("Waitlist", WaitlistSchema)