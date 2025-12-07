const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'profile_added', 'profile_removed', 'profile_updated']
  },
  profileNames: {
    type: String,
    required: false
  },
  
  field: {
    type: String,
    required: false
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timezone: {
    type: String,
    required: true
  }
});

eventLogSchema.index({ eventId: 1, timestamp: -1 });
module.exports = mongoose.model('EventLog', eventLogSchema);
