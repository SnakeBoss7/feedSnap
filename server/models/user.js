const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: String,
  profile:String,
  email: { type: String, unique: true },
  password: {type: String,default:"" },// if not using Firebase only
  role: { type: String, enum: ["admin", "member"], default: "member" },
  webURl: [String],
  BotQuote: String,
  userTier: { type: Number, min: 1, max: 3, default: 2 },
  firebaseId: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", UserSchema);
