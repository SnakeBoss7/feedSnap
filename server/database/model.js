const mongoose = require('mongoose');
const UserSchema = mongoose.Schema(
    {
        name: String,
        email: String,
        password: String,
        role: String,
        webURl:String,
        createdAt: { type: Date, default: Date.now }
    }
)