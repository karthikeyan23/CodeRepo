var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
  userID: String,
  nickname: String,
  sessionID:String,
  message: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', ChatSchema);