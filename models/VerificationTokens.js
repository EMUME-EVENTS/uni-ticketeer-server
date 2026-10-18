let mongoose = require("mongoose")

const VerificationTokensSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: new Date(),
        expires: '1h'
    }
})

module.exports = mongoose.model("VerificationTokens", VerificationTokensSchema)