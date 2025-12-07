import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfiles, setCurrentProfile } from './store/slices/profileSlice';
import { fetchEvents } from './store/slices/eventSlice';
import CreateEvent from './components/CreateEvent';
import EventsList from './components/EventsList';
import ProfileSelector from './components/ProfileSelector';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { items: profiles, currentProfile } = useSelector(state => state.profiles);
  const { items: events } = useSelector(state => state.events);

  useEffect(() => {
    dispatch(fetchProfiles());
  }, [dispatch]);

  useEffect(() => {
    if (currentProfile) {
      dispatch(fetchEvents({
        profileId: currentProfile._id,
        timezone: currentProfile.timezone
      }));
    }
  }, [dispatch, currentProfile]);

  const handleProfileChange = (profile) => {
    dispatch(setCurrentProfile(profile));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Event Management</h1>
            <p>Create and manage events across multiple timezones.</p>
          </div>
          <ProfileSelector
            profiles={profiles}
            currentProfile={currentProfile}
            onProfileChange={handleProfileChange}
          />
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <div className="left-panel">
            <CreateEvent
              profiles={profiles}
              currentProfile={currentProfile}
            />
          </div>
          <div className="right-panel">
            <EventsList
              events={events}
              currentProfile={currentProfile}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

