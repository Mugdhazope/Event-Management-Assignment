import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventLogs } from '../store/slices/eventSlice';
import './Modal.css';

const EventLogsModal = ({ event, currentProfile, onClose }) => {
  const dispatch = useDispatch();
  const { logs } = useSelector(state => state.events);
  const [loading, setLoading] = useState(true);

  const eventLogs = logs[event._id] || [];

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        await dispatch(fetchEventLogs({
          eventId: event._id,
          timezone: currentProfile?.timezone || 'America/New_York'
        })).unwrap();
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [dispatch, event._id, currentProfile]);


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content logs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Event Update History</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body logs-body">
          {loading ? (
            <div className="logs-loading">Loading logs...</div>
          ) : eventLogs.length === 0 ? (
            <div className="no-logs">No update history yet</div>
          ) : (
            <div className="logs-list">
              {eventLogs.map(log => (
                <div key={log._id} className="log-item">
                  <span className="log-icon">🕐</span>
                  <div className="log-content">
                    <div className="log-time">{log.display?.formatted || new Date(log.timestamp).toLocaleString()}</div>
                    <div className="log-message">{log.display?.message || 'Event updated'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLogsModal;

