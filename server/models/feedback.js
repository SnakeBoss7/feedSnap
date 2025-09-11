const mongoose = require('mongoose');
const bugSchema = new mongoose.Schema({
  title: String,
  description: String,
  severity: Number,
  rating: Number,
  status: Boolean,
  webUrl:String,
  pathname:String,
  email:String,
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now }
});

module.exports= mongoose.model('feedback', bugSchema);