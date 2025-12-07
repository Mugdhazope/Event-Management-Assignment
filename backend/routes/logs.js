const express = require('express');
const router = express.Router();
const EventLog = require('../models/EventLog');
const Event = require('../models/Event');
const Profile = require('../models/Profile');
const { formatDateTime } = require('../utils/timezone');

router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { timezone } = req.query;

    const logs = await EventLog.find({ eventId })
      .populate('profileId', 'name')
      .sort({ timestamp: -1 });

    const event = await Event.findById(eventId).populate('profileIds', 'name');

    const displayTimezone = timezone || 'America/New_York';
    const formattedLogs = logs.map(log => {
      const formatted = formatDateTime(log.timestamp, displayTimezone);
      
      let message = '';
      if (log.action === 'created') {
        message = 'Event created';
      } else if (log.action === 'updated') {
        if (log.field === 'startDateTime') {
          message = `Start date/time updated`;
        } else if (log.field === 'endDateTime') {
          message = `End date/time updated`;
        } else if (log.field === 'timezone') {
          message = `Timezone updated`;
        } else {
          message = `${log.field} updated`;
        }
      } else if (log.action === 'profile_updated') {
        message = `Profiles changed to: ${log.profileNames || ''}`;
      } else if (log.action === 'profile_added') {
        message = `Profile added: ${log.profileId?.name || ''}`;
      }
       else if (log.action === 'profile_removed') {
        message = `Profile removed: ${log.profileId?.name || ''}`;
      }

      return {
        _id: log._id,
        eventId: log.eventId,
        profileId: log.profileId,
        action: log.action,
        field: log.field,
        oldValue: log.oldValue,
        newValue: log.newValue,
        timestamp: log.timestamp,
        timezone: log.timezone,
        display: {
          formatted: formatted.full,
          message
        }
      };
    });

    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

