const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  profileIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  
  timezone: {
    type: String,
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },


  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ profileIds: 1 });
eventSchema.index({ startDateTime: 1 });
module.exports = mongoose.model('Event', eventSchema);
