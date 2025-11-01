import React from 'react';
import './EventCard.css';

const EventCard = ({ event, onUpdateStatus }) => {
  const formatDate = (dateString) => {
    const options = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <div className={`card event-card event-status-${event.status.toLowerCase()}`}>
      <div className="event-info">
        <h3>{event.title}</h3>
        <p>
          {formatDate(event.startTime)} - {formatDate(event.endTime)}
        </p>
      </div>
      <div className="event-status-and-actions">
        <span className="event-status-badge">{event.status.replace('_', ' ')}</span>
        <div className="event-actions">
          {event.status === 'BUSY' && (
            <button
              className="btn btn-warning"
              onClick={() => onUpdateStatus(event._id, 'SWAPPABLE')}
            >
              Make Swappable
            </button>
          )}
          {event.status === 'SWAPPABLE' && (
            <button
              className="btn btn-secondary"
              onClick={() => onUpdateStatus(event._id, 'BUSY')}
            >
              Make Busy
            </button>
          )}
          {event.status === 'SWAP_PENDING' && (
            <button className="btn" disabled>
              Pending Swap
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;