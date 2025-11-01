import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';
import Terminal from './pages/Terminal';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      socket.emit('joinUserRoom', user._id);
      
      socket.on('newSwapRequest', (data) => {
        showToast(data.message, 'info');
      });

      socket.on('swapResponse', (data) => {
        showToast(data.message, 'success');
      });
    }

    return () => {
      socket.off('newSwapRequest');
      socket.off('swapResponse');
    };
  }, [user, showToast]);

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={user ? <Dashboard /> : <Login />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/terminal" element={<Terminal />} />
          </Route>

        </Routes>
      </div>
    </>
  );
}

export default App;