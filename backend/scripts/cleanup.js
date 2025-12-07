const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
require('dotenv').config();

const cleanup = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    console.log('\n🧹 Cleaning database...\n');
    const profilesResult = await Profile.deleteMany({});
    const eventsResult = await Event.deleteMany({});
    const logsResult = await EventLog.deleteMany({});
    
    console.log(`✅ Deleted ${profilesResult.deletedCount} profile(s)`);
    console.log(`✅ Deleted ${eventsResult.deletedCount} event(s)`);
    console.log(`✅ Deleted ${logsResult.deletedCount} log entry/entries`);
    
    const profileCount = await Profile.countDocuments();
    const eventCount = await Event.countDocuments();
    const logCount = await EventLog.countDocuments();  
    console.log('\n📊 Verification:');
    console.log(`   Profiles: ${profileCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Logs: ${logCount}`);
    
    if (profileCount === 0 && eventCount === 0 && logCount === 0) {
      console.log('\n Database cleaned successfully!');
    } else {
      console.log('\n Some data may still exist. Please check manually.');
    }
    
    await mongoose.connection.close();
    console.log('\n Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n Error cleaning database:', error.message);
    process.exit(1);
  }
};

cleanup();

