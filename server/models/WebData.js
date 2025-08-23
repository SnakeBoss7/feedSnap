const mongoose = require('mongoose');
const scriptSchema = new mongoose.Schema({
  webUrl: {
    type: String,
    required: true,
  },
  color: String,
  modeColor:String,
  bgColor: String,
  position: String,
  metadata: String,
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
