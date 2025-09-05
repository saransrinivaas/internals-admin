import './i18n';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import DepartmentLogin from './components/DepartmentLogin';
import DepartmentDashboard from './components/DepartmentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/dept-login" element={<DepartmentLogin />} />
        <Route path="/dept-dashboard" element={<DepartmentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
