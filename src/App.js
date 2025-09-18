import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import PlayerDashboard from './components/PlayerDashboard';
import QuizPlayer from './components/QuizPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Unauthorized from './components/Unauthorized';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/player'} replace /> : <LandingPage />} />
          <Route 
            path="/login" 
            element={
              user ? 
                <Navigate to={user.role === 'ADMIN' ? '/admin' : '/player'} replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <Register />} 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Player Routes */}
          <Route 
            path="/player" 
            element={
              <ProtectedRoute requiredRole="PLAYER">
                <PlayerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute requiredRole="PLAYER">
                <QuizPlayer />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile Route (accessible to all authenticated users) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;