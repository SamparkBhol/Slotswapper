import React from 'react';
import './SwapRequestCard.css';
import { getAvatarUrl } from '../utils/getAvatarUrl';

const SwapRequestCard = ({ request, type, onRespond, currentUserId }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '...';
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const { requesterUser, receiverUser, requesterSlot, receiverSlot, status } = request;

  if (type === 'incoming') {
    return (
      <div className="card swap-card swap-incoming">
        <div className="swap-card-header">
          <img src={getAvatarUrl(requesterUser.name)} alt={requesterUser.name} />
          <p>
            <strong>{requesterUser.name}</strong> wants to swap:
          </p>
        </div>
        <div className="slot-info offered">
          <strong>{requesterSlot.title}</strong>
          <p>{formatDate(requesterSlot.startTime)}</p>
        </div>
        <p className="swap-arrow">for your slot:</p>
        <div className="slot-info requested">
          <strong>{receiverSlot.title}</strong>
          <p>{formatDate(receiverSlot.startTime)}</p>
        </div>
        <div className="swap-actions">
          <button
            className="btn btn-success"
            onClick={() => onRespond(request._id, true)}
          >
            Accept
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onRespond(request._id, false)}
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  if (type === 'outgoing') {
    return (
      <div className="card swap-card swap-outgoing">
        <div className="swap-card-header">
          <img src={getAvatarUrl(receiverUser.name)} alt={receiverUser.name} />
          <p>
            You offered to <strong>{receiverUser.name}</strong>:
          </p>
        </div>
        <div className="slot-info offered">
          <strong>{requesterSlot.title}</strong>
          <p>{formatDate(requesterSlot.startTime)}</p>
        </div>
        <p className="swap-arrow">in exchange for:</p>
        <div className="slot-info requested">
          <strong>{receiverSlot.title}</strong>
          <p>{formatDate(receiverSlot.startTime)}</p>
        </div>
        <div className="swap-status status-pending">
          Status: <strong>{status}</strong>
        </div>
      </div>
    );
  }
  
  if (type === 'history') {
    const isRequester = requesterUser._id === currentUserId;
    const otherUser = isRequester ? receiverUser : requesterUser;
    
    return (
      <div className={`card swap-card swap-history swap-status-${status.toLowerCase()}`}>
        <div className="swap-card-header">
          <img src={getAvatarUrl(otherUser.name)} alt={otherUser.name} />
          <p>
            {isRequester ? 
              `You offered a swap to ${otherUser.name}` :
              `${otherUser.name} offered you a swap`
            }
          </p>
        </div>
        <div className="slot-info offered">
          <strong>{requesterSlot.title}</strong>
          <p>{formatDate(requesterSlot.startTime)}</p>
        </div>
        <p className="swap-arrow">for</p>
        <div className="slot-info requested">
          <strong>{receiverSlot.title}</strong>
          <p>{formatDate(receiverSlot.startTime)}</p>
        </div>
        <div className={`swap-status status-${status.toLowerCase()}`}>
          Status: <strong>{status}</strong>
        </div>
      </div>
    );
  }

  return null;
};

export default SwapRequestCard;