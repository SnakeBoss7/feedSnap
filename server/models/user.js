const mongoose = require('mongoose');
const { route } = require('../routes/scriptRoute');
const UserSchema = mongoose.Schema(
    {
        name: String,
        email: String,
        userId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        webURl:[String],
        UserTier:{ type: Number, min: 1, max: 3 },
        BotQuote:String,
        firebaseId: String,
        route:String,
        createdAt: { type: Date, default: Date.now }
    }
)
module.exports = mongoose.model('user', UserSchema);