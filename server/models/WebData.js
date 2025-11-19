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
  ackMail: Boolean,
  bgColor:String,
  email: Boolean,
  botContext:String,
   owner: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
}, 
{
  timestamps: true, // Optional: adds createdAt & updatedAt
});

module.exports = mongoose.model('webData', scriptSchema);
