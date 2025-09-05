import './i18n';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
