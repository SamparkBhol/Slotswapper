import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Marketplace.css';
import { useToast } from '../context/ToastContext';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { checkConflict } from '../utils/checkConflict';

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState('');
  const [receiverSchedule, setReceiverSchedule] = useState([]);

  const { showToast } = useToast();

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const fetchMarketplace = async () => {
    try {
      const { data } = await api.get('/swap/swappable-slots');
      setSwappableSlots(data);
    } catch (err) {
      setError('Failed to fetch swappable slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
        const { data } = await api.get('/events');
        setMySlots(data.filter(event => event.status === 'SWAPPABLE'));
    } catch (err) {
        console.error(err);
    }
  }

  useEffect(() => {
    fetchMarketplace();
    fetchMySwappableSlots();
  }, []);

  const handleOpenModal = async (slot) => {
    setModalLoading(true);
    setSelectedTheirSlot(slot);
    setSelectedMySlot('');
    setShowModal(true);

    try {
      // THIS IS THE NEW LOGIC
      const receiverId = slot.owner._id;
      const { data } = await api.get(`/events/user/${receiverId}`);
      setReceiverSchedule(data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch receiver\'s schedule', 'error');
      handleCloseModal();
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTheirSlot(null);
    setReceiverSchedule([]);
  };

  const handleSubmitSwap = async (e) => {
    e.preventDefault();
    if (!selectedMySlot) {
        showToast('Please select one of your slots to offer.', 'error');
        return;
    }
    try {
        await api.post('/swap/swap-request', {
            mySlotId: selectedMySlot,
            theirSlotId: selectedTheirSlot._id
        });
        showToast('Swap request sent!', 'success');
        handleCloseModal();
        fetchMarketplace();
        fetchMySwappableSlots();
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to send request';
        showToast(message, 'error');
        console.error(err);
    }
  };

  // --- SMART FILTER LOGIC ---
  const getAvailableSlots = () => {
    return mySlots.filter(mySlot => {
      // Check for conflicts against the receiver's full schedule
      return !checkConflict(mySlot, receiverSchedule);
    });
  };

  if (loading) {
    return <p>Loading marketplace...</p>;
  }
  
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Marketplace</h2>
      <p>Here are all slots available for swapping.</p>
      <div className="marketplace-grid">
        {swappableSlots.length === 0 ? (
          <p>No slots are currently available for swapping.</p>
        ) : (
          swappableSlots.map((slot) => (
            <div key={slot._id} className="card marketplace-card">
              <div className="card-owner">
                <img src={getAvatarUrl(slot.owner.name)} alt={slot.owner.name} />
                <strong>{slot.owner.name}</strong>
              </div>
              <h3>{slot.title}</h3>
              <p>{formatDate(slot.startTime)}</p>
              <button className="btn" onClick={() => handleOpenModal(slot)}>
                Request Swap
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && selectedTheirSlot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmitSwap}>
              <h2>Request a Swap</h2>
              <p>You are requesting to swap for:</p>
              <div className="slot-info">
                  <strong>{selectedTheirSlot.title}</strong>
                  <p>{formatDate(selectedTheirSlot.startTime)}</p>
              </div>
              
              <label htmlFor="my-slot-select">Choose your slot to offer:</label>
              {modalLoading ? (
                <p>Checking receiver's schedule...</p>
              ) : (
                <select 
                  id="my-slot-select" 
                  value={selectedMySlot}
                  onChange={(e) => setSelectedMySlot(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your slot...</option>
                  {getAvailableSlots().length === 0 && (
                    <option disabled>You have no slots that don't conflict with this user</option>
                  )}
                  {getAvailableSlots().map(slot => (
                      <option key={slot._id} value={slot._id}>
                          {slot.title} ({formatDate(slot.startTime)})
                      </option>
                  ))}
                </select>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={modalLoading}>Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;