const mongoose = require("mongoose");
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  webData: { type: mongoose.Types.ObjectId, ref: "WebData", required: true },
  members: [
    {
      user: { type: mongoose.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["owner", "editor", "viewer"], default: "viewer" }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);