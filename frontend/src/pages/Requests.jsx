import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SwapRequestCard from '../components/SwapRequestCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './Requests.css';

const Requests = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/swap/my-requests');
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
      setHistory(data.history);
      setError('');
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async (id, accept) => {
    try {
      await api.post(`/swap/swap-response/${id}`, { accept });
      showToast(`Swap ${accept ? 'accepted' : 'rejected'}!`, 'success');
      fetchRequests();
    } catch (err) {
      showToast('Failed to respond to swap.', 'error');
      console.error(err);
    }
  };

  if (loading) {
    return <p>Loading requests...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="requests-container">
      <div className="requests-column">
        <h2>Incoming</h2>
        {incoming.length === 0 ? (
          <p>You have no incoming swap requests.</p>
        ) : (
          incoming.map((req) => (
            <SwapRequestCard
              key={req._id}
              request={req}
              type="incoming"
              onRespond={handleRespond}
            />
          ))
        )}
      </div>

      <div className="requests-column">
        <h2>Outgoing</h2>
        {outgoing.length === 0 ? (
          <p>You have no outgoing swap requests.</p>
        ) : (
          outgoing.map((req) => (
            <SwapRequestCard 
              key={req._id} 
              request={req} 
              type="outgoing" 
            />
          ))
        )}
      </div>

      <div className="requests-column-full">
        <h2>History</h2>
        {history.length === 0 ? (
          <p>You have no completed or rejected swaps.</p>
        ) : (
          history.map((req) => (
            <SwapRequestCard
              key={req._id}
              request={req}
              type="history"
              currentUserId={user._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Requests;