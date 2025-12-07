const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { name, timezone } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Profile name is required' });
    }
    const existingProfile = await Profile.findOne({ name: name.trim() });
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile with this name already exists' });
    }

    const profile = new Profile({
      name: name.trim(),
      timezone: timezone || 'America/New_York'
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { timezone } = req.body;
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.timezone = timezone || profile.timezone;
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;