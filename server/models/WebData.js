const mongoose = require('mongoose');
const scriptSchema = new mongoose.Schema({
  webUrl: {
    type: String,
    required: true,
  },
  color: String,
  bgColor:String,
  position: String,
  text: String,
  email:Boolean,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, // Optional: adds createdAt & updatedAt
});

module.exports = mongoose.model('webData', scriptSchema);
