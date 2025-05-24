import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { NotificationProvider, NotificationToast } from './components/communication/NotificationProvider';

// Auth Pages
import SignIn from './pages/auth/signin';
import SignUp from './pages/auth/signup';
import Unauthorized from './pages/auth/Unauthorized';

// Protected Routes
import { 
  AuthRoute, 
  PublicRoute, 
  UserRoute, 
  VolunteerRoute, 
  FirstResponderRoute, 
  GovernmentRoute, 
  PrivateRoute 
} from './components/ProtectedRoute';

// Pages
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

import VideoFrameGrid from './components/VideoFrameGrid';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <NotificationToast />      <Routes>
        {/* Public Auth Routes */}
        <Route path="/auth/signin" element={
          <AuthRoute>
            <SignIn />
          </AuthRoute>
        } />
        
        <Route path="/auth/signup" element={
          <AuthRoute>
            <SignUp />
          </AuthRoute>
        } />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Private Routes with AppLayout */}
        
        {/* User Routes */}
        <Route path="/user" element={
          <UserRoute>
            <AppLayout>
              <Routes>
                <Route index element={<UserDashboard />} />
                <Route path="reports" element={<EmergencyReports />} />
                <Route path="resources" element={<UserResources />} />
                <Route path="messages" element={<CommunicationHub />} />
              </Routes>
            </AppLayout>
          </UserRoute>
        } />
        
        {/* Volunteer Routes */}
        <Route path="/volunteer" element={
          <VolunteerRoute>
            <AppLayout>
              <Routes>
                <Route index element={<VolunteerDashboard />} />
                <Route path="assignments" element={<VolunteerAssignments />} />
                <Route path="resources" element={<VolunteerResources />} />
                <Route path="messages" element={<CommunicationHub />} />
              </Routes>
            </AppLayout>
          </VolunteerRoute>
        } />
        
        {/* First Responder Routes */}
        <Route path="/first_responder" element={
          <FirstResponderRoute>
            <AppLayout>
              <Routes>
                <Route index element={<FirstResponderDashboard />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="resources" element={<Resources />} />
                <Route path="teams" element={<Teams />} />
                <Route path="messages" element={<CommunicationHub />} />
              </Routes>
            </AppLayout>
          </FirstResponderRoute>
        } />
        
        {/* Government Routes */}
        <Route path="/government" element={
          <GovernmentRoute>
            <AppLayout>
              <Routes>
                <Route index element={<GovernmentDashboard />} />
                <Route path="overview" element={<Overview />} />
                <Route path="resources" element={<GovernmentResources />} />
                <Route path="reports" element={<Reports />} />
                <Route path="messages" element={<CommunicationHub />} />
              </Routes>
            </AppLayout>
          </GovernmentRoute>
        } />
        
        {/* Profile Route (accessible to all authenticated users) */}
        <Route path="/private/profile" element={
          <PrivateRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </PrivateRoute>
        } />
        
        {/* Demo Routes - will be removed in production */}
        <Route path="/public/*" element={
          <PublicRoute>
            <VideoFrameGrid onImageReady={() => {}} onClose={() => {}} />
          </PublicRoute>
        } />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/auth/signin" replace />} />
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;