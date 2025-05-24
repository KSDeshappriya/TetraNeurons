import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { NotificationProvider, NotificationToast } from './components/communication/NotificationProvider';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile';

// Dashboards
import UserDashboard from './pages/dashboards/UserDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import FirstResponderDashboard from './pages/dashboards/FirstResponderDashboard';
import GovernmentDashboard from './pages/dashboards/GovernmentDashboard';

// First Responder Pages
import Incidents from './pages/first_responder/Incidents';
import Resources from './pages/first_responder/Resources';
import Teams from './pages/first_responder/Teams';

// Government Pages
import Overview from './pages/government/Overview';
import GovernmentResources from './pages/government/Resources';
import Reports from './pages/government/Reports';

// User Pages
import EmergencyReports from './pages/user/EmergencyReports';
import UserResources from './pages/user/UserResources';

// Volunteer Pages
import VolunteerAssignments from './pages/volunteer/VolunteerAssignments';
import VolunteerResources from './pages/volunteer/VolunteerResources';

// Communication
import CommunicationHub from './pages/communication/CommunicationHub';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <NotificationToast />
      <Routes>
        {/* Home page without authentication */}
        <Route path="/" element={<Home />} />
        
        {/* Main dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* User Routes */}
        <Route path="/user" element={
          <AppLayout>
            <Routes>
              <Route index element={<UserDashboard />} />
              <Route path="reports" element={<EmergencyReports />} />
              <Route path="resources" element={<UserResources />} />
            </Routes>
          </AppLayout>
        } />
        
        {/* Volunteer Routes */}
        <Route path="/volunteer" element={
          <AppLayout>
            <Routes>
              <Route index element={<VolunteerDashboard />} />
              <Route path="assignments" element={<VolunteerAssignments />} />
              <Route path="resources" element={<VolunteerResources />} />
            </Routes>
          </AppLayout>
        } />
        
        {/* First Responder Routes */}
        <Route path="/first_responder" element={
          <AppLayout>
            <Routes>
              <Route index element={<FirstResponderDashboard />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="resources" element={<Resources />} />
              <Route path="teams" element={<Teams />} />
            </Routes>
          </AppLayout>
        } />
        
        {/* Government Routes */}
        <Route path="/government" element={
          <AppLayout>
            <Routes>
              <Route index element={<GovernmentDashboard />} />
              <Route path="overview" element={<Overview />} />
              <Route path="resources" element={<GovernmentResources />} />
              <Route path="reports" element={<Reports />} />
            </Routes>
          </AppLayout>
        } />
        
        {/* Communication */}
        <Route path="/communication" element={
          <AppLayout>
            <CommunicationHub />
          </AppLayout>
        } />
        
        {/* Profile Route */}
        <Route path="/profile" element={
          <AppLayout>
            <Profile />
          </AppLayout>
        } />
        
        {/* Settings placeholder */}
        <Route path="/settings" element={
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
              <p className="text-gray-600">Settings page - Coming soon</p>
            </div>
          </AppLayout>
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;
