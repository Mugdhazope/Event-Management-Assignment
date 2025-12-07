import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, fetchEvents } from '../store/slices/eventSlice';
import { timezones, getTimezoneLabel } from '../utils/timezone';
import dayjs from 'dayjs';
import './Modal.css';

const EditEventModal = ({ event, currentProfile, onClose }) => {
  const dispatch = useDispatch();
  const { items: allProfiles } = useSelector(state => state.profiles);
  const [selectedProfiles, setSelectedProfiles] = useState(event.profileIds.map(p => p._id || p));
  const [timezone, setTimezone] = useState(event.timezone);
  const [startDate, setStartDate] = useState(dayjs(event.startDateTime).format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState(dayjs(event.startDateTime).format('HH:mm'));
  const [endDate, setEndDate] = useState(dayjs(event.endDateTime).format('YYYY-MM-DD'));
  const [endTime, setEndTime] = useState(dayjs(event.endDateTime).format('HH:mm'));
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [profileSearch, setProfileSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const timezoneDropdownRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (timezoneDropdownRef.current && !timezoneDropdownRef.current.contains(event.target)) {
        setShowTimezoneDropdown(false);
      }
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target)) {
        setShowStartCalendar(false);
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target)) {
        setShowEndCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const filteredProfiles = allProfiles.filter(p =>
    p.name?.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const toggleProfile = (profileId) => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (selectedProfiles.length === 0) {
      alert('At least one profile must be selected');
      setLoading(false);
      return;
    }
    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    try {
      await dispatch(updateEvent({
        id: event._id,
        profileId: currentProfile._id,
        profileIds: selectedProfiles,
        timezone,
        startDateTime,
        endDateTime
      })).unwrap();
      if (currentProfile) {
        dispatch(fetchEvents({
          profileId: currentProfile._id,
          timezone: currentProfile.timezone
        }));
      }

      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating event');
    } finally {
      setLoading(false);
    }
  };
  const getSelectedProfilesText = () => {
    if (selectedProfiles.length === 0) return 'Select profiles...';
    if (selectedProfiles.length === 1) {
      const profile = allProfiles.find(p => p._id === selectedProfiles[0]);
      return profile ? profile.name : '1 profile selected';
    }
    return `${selectedProfiles.length} profiles selected`;
  };
  const generateCalendarDays = (year, month) => {
    const firstDay = dayjs(`${year}-${month}-01`);
    const daysInMonth = firstDay.daysInMonth();
    const startDay = firstDay.day();
    const days = [];

    const prevMonth = firstDay.subtract(1, 'month');
    const prevDaysInMonth = prevMonth.daysInMonth();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: prevDaysInMonth - i,
        month: prevMonth.month(),
        year: prevMonth.year(),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        month: firstDay.month(),
        year: firstDay.year(),
        isCurrentMonth: true
      });
    }



    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        month: firstDay.add(1, 'month').month(),
        year: firstDay.add(1, 'month').year(),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const [startCalendarMonth, setStartCalendarMonth] = useState(dayjs(startDate));
  const [endCalendarMonth, setEndCalendarMonth] = useState(dayjs(endDate));
  const formatDateDisplay = (date) => {
    if (!date) return 'Pick a date';
    return dayjs(date).format('MMMM D, YYYY');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>Edit Event</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Profiles</label>
            <div className="dropdown-wrapper" ref={profileDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {getSelectedProfilesText()}
                <span className="dropdown-arrow">▼</span>
              </button>
              {showProfileDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-search">
                    <input
                      type="text"
                      placeholder="🔍 Search profiles..."
                      value={profileSearch}
                      onChange={(e) => setProfileSearch(e.target.value)}
                    />
                  </div>
                  <div className="dropdown-list">
                    {filteredProfiles.map(profile => (
                      <div
                        key={profile._id}
                        className={`dropdown-item ${selectedProfiles.includes(profile._id) ? 'selected' : ''}`}
                        onClick={() => toggleProfile(profile._id)}
                      >
                        {selectedProfiles.includes(profile._id) && <span className="checkmark">✓</span>}
                        {profile.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <div className="dropdown-wrapper" ref={timezoneDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              >
                {getTimezoneLabel(timezone)}
                <span className="dropdown-arrow">▼</span>
              </button>
              {showTimezoneDropdown && (
                <div className="dropdown-menu">
                  {timezones.map(tz => (
                    <div
                      key={tz.value}
                      className={`dropdown-item ${timezone === tz.value ? 'selected' : ''}`}
                      onClick={() => {
                        setTimezone(tz.value);
                        setShowTimezoneDropdown(false);
                      }}
                    >
                      {timezone === tz.value && <span className="checkmark">✓</span>}
                      {tz.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Start Date & Time</label>
            <div className="date-time-group">
              <div className="date-picker-wrapper" ref={startCalendarRef}>
                <button
                  type="button"
                  className="date-button"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                >
                  <span className="calendar-icon">📅</span>
                  {formatDateDisplay(startDate)}
                </button>
                {showStartCalendar && (
                  <div className="calendar-popup">
                    <div className="calendar-header">
                      <button
                        type="button"
                        onClick={() => setStartCalendarMonth(prev => prev.subtract(1, 'month'))}
                      >
                        ‹
                      </button>
                      <span>{startCalendarMonth.format('MMMM YYYY')}</span>
                      <button
                        type="button"
                        onClick={() => setStartCalendarMonth(prev => prev.add(1, 'month'))}
                      >
                        ›
                      </button>
                    </div>
                    <div className="calendar-grid">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                      ))}
                      {generateCalendarDays(startCalendarMonth.year(), startCalendarMonth.month() + 1).map((day, idx) => (
                        <div
                          key={idx}
                          className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${startDate && dayjs(`${day.year}-${day.month + 1}-${day.date}`).format('YYYY-MM-DD') === startDate ? 'selected' : ''}`}
                          onClick={() => {
                            const selectedDate = dayjs(`${day.year}-${day.month + 1}-${day.date}`).format('YYYY-MM-DD');
                            setStartDate(selectedDate);
                            setShowStartCalendar(false);
                          }}
                        >
                          {day.date}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="time-picker-wrapper">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="time-input"
                />
                <span className="time-icon">🕐</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>End Date & Time</label>
            <div className="date-time-group">
              <div className="date-picker-wrapper" ref={endCalendarRef}>
                <button
                  type="button"
                  className="date-button"
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                >
                  <span className="calendar-icon">📅</span>
                  {formatDateDisplay(endDate)}
                </button>
                {showEndCalendar && (
                  <div className="calendar-popup">
                    <div className="calendar-header">
                      <button
                        type="button"
                        onClick={() => setEndCalendarMonth(prev => prev.subtract(1, 'month'))}
                      >
                        ‹
                      </button>
                      <span>{endCalendarMonth.format('MMMM YYYY')}</span>
                      <button
                        type="button"
                        onClick={() => setEndCalendarMonth(prev => prev.add(1, 'month'))}
                      >
                        ›
                      </button>
                    </div>
                    <div className="calendar-grid">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                      ))}
                      {generateCalendarDays(endCalendarMonth.year(), endCalendarMonth.month() + 1).map((day, idx) => (
                        <div
                          key={idx}
                          className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${endDate && dayjs(`${day.year}-${day.month + 1}-${day.date}`).format('YYYY-MM-DD') === endDate ? 'selected' : ''}`}
                          onClick={() => {
                            const selectedDate = dayjs(`${day.year}-${day.month + 1}-${day.date}`).format('YYYY-MM-DD');
                            setEndDate(selectedDate);
                            setShowEndCalendar(false);
                          }}
                        >
                          {day.date}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="time-picker-wrapper">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="time-input"
                />
                <span className="time-icon">🕐</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;

