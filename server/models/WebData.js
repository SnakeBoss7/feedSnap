const mongoose = require('mongoose');
const scriptSchema = new mongoose.Schema({
  webUrl: {
    type: String,
    required: true,
  },
  color: String,
  modeColor: String,
  position: String,
  widgetText:String,
  metadata: String,
  bgColor:String,
  email: Boolean,
   owner: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
  members: [{ type: mongoose.Types.ObjectId, ref: "User" }], // allow sharing

}, 
{
  timestamps: true, // Optional: adds createdAt & updatedAt
});

module.exports = mongoose.model('webData', scriptSchema);
