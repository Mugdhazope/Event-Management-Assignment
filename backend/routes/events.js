const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
const Profile = require('../models/Profile');
const { toUTC, fromUTC, formatDateTime, isValidTimezone } = require('../utils/timezone');

router.get('/', async (req, res) => {
  try {
    const { profileId, timezone } = req.query;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile id is required' });
    }
    const events = await Event.find({ profileIds: profileId })
      .populate('profileIds', 'name timezone')
      .sort({ startDateTime: 1 });

    const formattedEvents = events.map(event => {
      const displayTimezone = timezone || 'America/New_York';
      const start = formatDateTime(event.startDateTime, displayTimezone);
      const end = formatDateTime(event.endDateTime, displayTimezone);
      const created = formatDateTime(event.createdAt, displayTimezone);
      const updated = formatDateTime(event.updatedAt, displayTimezone);

      return {
        _id: event._id,
        profileIds: event.profileIds,
        timezone: event.timezone,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        display: {
          start,
          end,
          created,
          updated
        }
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { timezone } = req.query;
    const event = await Event.findById(req.params.id).populate('profileIds', 'name timezone');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const displayTimezone = timezone || 'America/New_York';
    const start = formatDateTime(event.startDateTime, displayTimezone);
    const end = formatDateTime(event.endDateTime, displayTimezone);
    const created = formatDateTime(event.createdAt, displayTimezone);
    const updated = formatDateTime(event.updatedAt, displayTimezone);

    res.json({
      ...event.toObject(),
      display: {
        start,
        end,
        created,
        updated
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { profileIds, timezone, startDateTime, endDateTime } = req.body;

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return res.status(400).json({ error: 'At least one profile is required' });
    }

    if (!timezone || !isValidTimezone(timezone)) {
      return res.status(400).json({ error: 'Valid timezone is required' });
    }

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ error: 'Start and end date/time are required' });
    }

    const profiles = await Profile.find({ _id: { $in: profileIds } });
    if (profiles.length !== profileIds.length) {
      return res.status(400).json({ error: 'One or more profiles not found' });
    }

    const startUTC = toUTC(startDateTime, timezone);
    const endUTC = toUTC(endDateTime, timezone);

    if (endUTC <= startUTC) {
      return res.status(400).json({ error: 'End date/time must be after start date/time' });
    }
    const now = new Date();
    if (endUTC < now) {
      return res.status(400).json({ error: 'End date/time cannot be in the past' });
    }

    const event = new Event({
      profileIds,
      timezone,
      startDateTime: startUTC,
      endDateTime: endUTC
    });

    await event.save();
    await event.populate('profileIds', 'name timezone');
    const log = new EventLog({
      eventId: event._id,
      profileId: profileIds[0],
      action: 'created',
      timestamp: new Date(),
      timezone
    });
    await log.save();

    const displayTimezone = timezone;
    const start = formatDateTime(event.startDateTime, displayTimezone);
    const end = formatDateTime(event.endDateTime, displayTimezone);
    const created = formatDateTime(event.createdAt, displayTimezone);
    const updated = formatDateTime(event.updatedAt, displayTimezone);

    res.status(201).json({
      ...event.toObject(),
      display: {
        start,
        end,
        created,
        updated
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { profileId, timezone, startDateTime, endDateTime, profileIds } = req.body;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const isParticipant = event.profileIds.some(id => id.toString() === profileId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not authorized to edit this event' });
    }
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const logs = [];
    if (timezone && timezone !== event.timezone && isValidTimezone(timezone)) {
      logs.push({
        eventId: event._id,
        profileId,
        action: 'updated',
        field: 'timezone',
        oldValue: event.timezone,
        newValue: timezone,
        timestamp: new Date(),
        timezone: profile.timezone
      });
      event.timezone = timezone;
    }
    if (startDateTime) {
      const newStartUTC = toUTC(startDateTime, event.timezone);
      if (newStartUTC.getTime() !== event.startDateTime.getTime()) {
        logs.push({
          eventId: event._id,
          profileId,
          action: 'updated',
          field: 'startDateTime',
          oldValue: fromUTC(event.startDateTime, profile.timezone).format('YYYY-MM-DD HH:mm'),
          newValue: fromUTC(newStartUTC, profile.timezone).format('YYYY-MM-DD HH:mm'),
          timestamp: new Date(),
          timezone: profile.timezone
        });
        event.startDateTime = newStartUTC;
      }
    }
    if (endDateTime) {
      const newEndUTC = toUTC(endDateTime, event.timezone);
      if (newEndUTC.getTime() !== event.endDateTime.getTime()) {
        logs.push({
          eventId: event._id,
          profileId,
          action: 'updated',
          field: 'endDateTime',
          oldValue: fromUTC(event.endDateTime, profile.timezone).format('YYYY-MM-DD HH:mm'),
          newValue: fromUTC(newEndUTC, profile.timezone).format('YYYY-MM-DD HH:mm'),
          timestamp: new Date(),
          timezone: profile.timezone
        });
        event.endDateTime = newEndUTC;
      }
    }

    
    if (profileIds && Array.isArray(profileIds)) {
      const added = profileIds.filter(id => !event.profileIds.some(eid => eid.toString() === id));
      const removed = event.profileIds.filter(eid => !profileIds.includes(eid.toString()));

      if (added.length > 0 || removed.length > 0) {
        const newProfiles = await Profile.find({ _id: { $in: profileIds } });
        const profileNames = newProfiles.map(p => p.name).join(', ');
        logs.push({
          eventId: event._id,
          profileId,
          action: 'profile_updated',
          field: 'profiles',
          oldValue: event.profileIds.map(id => id.toString()).join(','),
          newValue: profileIds.join(','),
          timestamp: new Date(),
          timezone: profile.timezone,
          profileNames: profileNames
        });

        event.profileIds = profileIds;
      }
    }

    if (event.endDateTime <= event.startDateTime) {
      return res.status(400).json({ error: 'End date/time must be after start date/time' });
    }

    event.updatedAt = new Date();
    await event.save();
    await event.populate('profileIds', 'name timezone');

    if (logs.length > 0) {
      await EventLog.insertMany(logs);
    }

    const displayTimezone = profile.timezone;
    const start = formatDateTime(event.startDateTime, displayTimezone);
    const end = formatDateTime(event.endDateTime, displayTimezone);
    const created = formatDateTime(event.createdAt, displayTimezone);
    const updated = formatDateTime(event.updatedAt, displayTimezone);

    res.json({
      ...event.toObject(),
      display: {
        start,
        end,
        created,
        updated
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

