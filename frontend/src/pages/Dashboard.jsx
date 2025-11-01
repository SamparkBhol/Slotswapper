import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import StatsCard from '../components/StatsCard';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [swapStats, setSwapStats] = useState({ completed: 0, rejected: 0 });
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const { showToast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch your events', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/swap/my-stats');
      setSwapStats(data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch your stats', 'error');
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !startTime || !endTime) {
      return setError('All fields are required');
    }
    try {
      await api.post('/events', { title, startTime, endTime });
      showToast('Event created successfully!', 'success');
      setTitle('');
      setStartTime('');
      setEndTime('');
      fetchEvents();
    } catch (err) {
      setError('Failed to create event');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/events/${id}`, { status });
      showToast('Event status updated!', 'success');
      fetchEvents();
    } catch (err) {
      showToast('Could not update status', 'error');
      console.error(err);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'ALL') return true;
    return event.status === filter;
  });

  const localStats = useMemo(() => {
    return {
      total: events.length,
      swappable: events.filter(e => e.status === 'SWAPPABLE').length,
      pending: events.filter(e => e.status === 'SWAP_PENDING').length
    };
  }, [events]);

  const swapSuccessRate = useMemo(() => {
    const total = swapStats.completed + swapStats.rejected;
    if (total === 0) return 0;
    return Math.round((swapStats.completed / total) * 100);
  }, [swapStats]);

  return (
    <>
      <div className="stats-bar">
        <StatsCard 
          title="Total Events" 
          value={localStats.total} 
          color="primary-color" 
          icon="📅" 
        />
        <StatsCard 
          title="Swappable Slots" 
          value={localStats.swappable} 
          color="warning-color"
          icon="🔄"
        />
        <StatsCard 
          title="Pending Swaps" 
          value={localStats.pending} 
          color="secondary-color"
          icon="⏳"
        />
      </div>
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="card">
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="create-event-form">
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <div>
                <label>Event Title</label>
                <input
                  type="text"
                  placeholder="e.g., Team Meeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                Create Event
              </button>
            </form>
          </div>
          
          <div className="card stats-widget">
            <h2>My Swap Stats</h2>
            <div className="stat-item">
              <span>Swaps Completed</span>
              <strong>{swapStats.completed}</strong>
            </div>
            <div className="stat-item">
              <span>Swaps Rejected</span>
              <strong>{swapStats.rejected}</strong>
            </div>
            <div className="stat-item success-rate">
              <span>Success Rate</span>
              <strong>{swapSuccessRate}%</strong>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <h2>My Events</h2>
          
          <div className="filter-tabs">
            <button
              className={filter === 'ALL' ? 'active' : ''}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            <button
              className={filter === 'SWAPPABLE' ? 'active' : ''}
              onClick={() => setFilter('SWAPPABLE')}
            >
              Swappable
            </button>
            <button
              className={filter === 'SWAP_PENDING' ? 'active' : ''}
              onClick={() => setFilter('SWAP_PENDING')}
            >
              Pending
            </button>
          </div>

          <div>
            {filteredEvents.length === 0 ? (
              <div className="card">
                <p>No events found for this filter.</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;