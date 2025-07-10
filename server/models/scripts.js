const mongoose = require('mongoose');
const scriptSchema = new mongoose.Schema({
  webUrl: {
    type: String,
    required: true,
  },
  color: String,
  position: String,
  text: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, // Optional: adds createdAt & updatedAt
});

module.exports = mongoose.model('Script', scriptSchema);
