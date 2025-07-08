const mongoose = require('mongoose');
const UserSchema = mongoose.Schema(
    {
        name: String,
        email: String,
        webURl:String,
        firebaseId: String,
        createdAt: { type: Date, default: Date.now }
    }
)
module.exports = mongoose.model('User', UserSchema);