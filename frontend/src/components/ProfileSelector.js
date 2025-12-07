import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProfile, setCurrentProfile } from '../store/slices/profileSlice';
import { timezones } from '../utils/timezone';
import './ProfileSelector.css';

const ProfileSelector = ({ profiles, currentProfile, onProfileChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddForm(false);
        setNewProfileName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && !currentProfile) {
      dispatch(setCurrentProfile(profiles[0]));
      onProfileChange(profiles[0]);
    }
  }, [profiles, currentProfile, dispatch, onProfileChange]);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileSelect = (profile) => {
    dispatch(setCurrentProfile(profile));
    onProfileChange(profile);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      const newProfile = await dispatch(createProfile({
        name: newProfileName.trim(),
        timezone: 'America/New_York'
      })).unwrap();

      dispatch(setCurrentProfile(newProfile));
      onProfileChange(newProfile);
      setNewProfileName('');
      setShowAddForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  return (
    <div className="profile-selector" ref={dropdownRef}>
      <button
        className="profile-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentProfile ? currentProfile.name : 'Select current profile...'}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-search">
            <input
              type="text"
              placeholder="🔍 Search current profile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="profile-list">
            {filteredProfiles.map(profile => (
              <div
                key={profile._id}
                className={`profile-item ${currentProfile?._id === profile._id ? 'selected' : ''}`}
                onClick={() => handleProfileSelect(profile)}
              >
                {currentProfile?._id === profile._id && <span className="checkmark">✓</span>}
                {profile.name}
              </div>
            ))}
          </div>

          {!showAddForm ? (
            <div className="add-profile-section">
              <input
                type="text"
                placeholder="beta"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setShowAddForm(true);
                  }
                }}
                className="add-profile-input"
              />
              <button
                className="add-profile-button"
                onClick={() => {
                  if (newProfileName.trim()) {
                    setShowAddForm(true);
                  }
                }}
              >
                Add
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddProfile} className="add-profile-form">
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter profile name"
                className="add-profile-input"
                autoFocus
              />
              <button type="submit" className="add-profile-submit">
                Add Profile
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;

