import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEvents } from '../store/slices/eventSlice';
import { timezones, getTimezoneLabel } from '../utils/timezone';
import EditEventModal from './EditEventModal';
import EventLogsModal from './EventLogsModal';
import './EventsList.css';

const EventsList = ({ events, currentProfile }) => {
  const dispatch = useDispatch();
  const [viewTimezone, setViewTimezone] = useState(currentProfile?.timezone || 'America/New_York');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingLogs, setViewingLogs] = useState(null);
  const timezoneDropdownRef = useRef(null);

  useEffect(() => {
    if (currentProfile) {
      setViewTimezone(currentProfile.timezone);
    }
  }, [currentProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timezoneDropdownRef.current && !timezoneDropdownRef.current.contains(event.target)) {
        setShowTimezoneDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimezoneChange = (newTimezone) => {
    setViewTimezone(newTimezone);
    setShowTimezoneDropdown(false);
    if (currentProfile) {
      dispatch(fetchEvents({
        profileId: currentProfile._id,
        timezone: newTimezone
      }));
    }
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes(',')) {
      return dateStr;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatEventTime = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes(':')) {
      return dateStr;
    }
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="events-list">
      <div className="events-header">
        <h2>Events</h2>
        <div className="timezone-selector-wrapper">
          <label>View in Timezone</label>
          <div className="timezone-dropdown-wrapper" ref={timezoneDropdownRef}>
            <button
              className="timezone-button"
              onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
            >
              {getTimezoneLabel(viewTimezone)}
              <span className="dropdown-arrow">▼</span>
            </button>
            {showTimezoneDropdown && (
              <div className="timezone-dropdown-menu">
                {timezones.map(tz => (
                  <div
                    key={tz.value}
                    className={`timezone-item ${viewTimezone === tz.value ? 'selected' : ''}`}
                    onClick={() => handleTimezoneChange(tz.value)}
                  >
                    {viewTimezone === tz.value && <span className="checkmark">✓</span>}
                    {tz.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="events-content">
        {events.length === 0 ? (
          <div className="no-events">No events found</div>
        ) : (
          <div className="events-grid">
            {events.map(event => {
              const profileNames = event.profileIds.map(p => p.name).join(', ');
              return (
                <div key={event._id} className="event-card">
                  <div className="event-profiles">
                    <span className="profile-icon">👤</span>
                    {profileNames}
                  </div>
                  
                  <div className="event-dates">
                    <div className="event-date-item">
                      <span className="date-label">Start:</span>
                      <div className="date-time-group">
                        <span className="date-icon">📅</span>
                        <span>{event.display?.start?.date || formatEventDate(event.startDateTime)}</span>
                        <span className="time-icon">🕐</span>
                        <span>{event.display?.start?.time || formatEventTime(event.startDateTime)}</span>
                      </div>
                    </div>
                    <div className="event-date-item">
                      <span className="date-label">End:</span>
                      <div className="date-time-group">
                        <span className="date-icon">📅</span>
                        <span>{event.display?.end?.date || formatEventDate(event.endDateTime)}</span>
                        <span className="time-icon">🕐</span>
                        <span>{event.display?.end?.time || formatEventTime(event.endDateTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="event-meta">
                    <div>Created: {event.display?.created?.date || formatEventDate(event.createdAt)} at {event.display?.created?.time || formatEventTime(event.createdAt)}</div>
                    <div>Updated: {event.display?.updated?.date || formatEventDate(event.updatedAt)} at {event.display?.updated?.time || formatEventTime(event.updatedAt)}</div>
                  </div>

                  <div className="event-actions">
                    <button
                      className="edit-button"
                      onClick={() => setEditingEvent(event)}
                    >
                      <span>✏️</span> Edit
                    </button>
                    <button
                      className="logs-button"
                      onClick={() => setViewingLogs(event)}
                    >
                      <span>📄</span> View Logs
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          currentProfile={currentProfile}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {viewingLogs && (
        <EventLogsModal
          event={viewingLogs}
          currentProfile={currentProfile}
          onClose={() => setViewingLogs(null)}
        />
      )}
    </div>
  );
};

export default EventsList;

