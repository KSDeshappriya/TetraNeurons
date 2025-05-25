import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { NotificationProvider, NotificationToast } from './components/communication/NotificationProvider';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile';

// Auth Pages
import SignIn from './pages/auth/signin';
import SignUp from './pages/auth/signup';

// Dashboards
import UserDashboard from './pages/dashboards/UserDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import FirstResponderDashboard from './pages/dashboards/FirstResponderDashboard';
import GovernmentDashboard from './pages/dashboards/GovernmentDashboard';

// First Responder Pages
import  Incidents  from './pages/first_responder/first_responder_Incidents';
import  Resources  from './pages/first_responder/first_responder_Resources';
import  Teams  from './pages/first_responder/first_responder_Teams';

// Government Pages
import  GovernmentOverview from './pages/government/Government_Overview';
import  GovernmentResources  from './pages/government/Government_Resources';
import  GovernmentReports  from './pages/government/Government_Reports';

// User Pages
import  EmergencyReports from './pages/user/User_EmergencyReports';
import  UserResources from './pages/user/UserResources';

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
        {/* Public Auth Routes */}
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* Home page without authentication */}
        <Route path="/" element={<Home />} />
        
        {/* Main dashboard */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />



        {/* User Dashboard (index) */}
          <Route path="/user" element={
            <AppLayout>
              <UserDashboard />
            </AppLayout>
          } />

          {/* Emergency Reports */}
          <Route path="/user/reports" element={
            <AppLayout>
              <EmergencyReports />
            </AppLayout>
          } />

          {/* User Resources */}
          <Route path="/user/resources" element={
            <AppLayout>
              <UserResources />
            </AppLayout>
          } />

          {/* Communication */}
          <Route path="/user/communication" element={
            <AppLayout>
              <CommunicationHub />
            </AppLayout>
          } />

        
        
        {/* Volunteer Dashboard (index) */}
          <Route path="/volunteer" element={
            <AppLayout>
              <VolunteerDashboard />
            </AppLayout>
          } />

          {/* Volunteer Assignments */}
          <Route path="/volunteer/assignments" element={
            <AppLayout>
              <VolunteerAssignments />
            </AppLayout>
          } />

          {/* Volunteer Resources */}
          <Route path="/volunteer/resources" element={
            <AppLayout>
              <VolunteerResources />
            </AppLayout>
          } />

          {/* Communication */}
          <Route path="/volunteer/communication" element={
            <AppLayout>
              <CommunicationHub />
            </AppLayout>
          } />

          {/* Training (Coming Soon) */}
          <Route path="/volunteer/training" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Training</h1>
                <p className="text-gray-600">Training page - Coming soon</p>
              </div>
            </AppLayout>
          } />

        
          {/* First Responder Dashboard (index) */}
        <Route path="/first_responder" element={
          <AppLayout>
            <FirstResponderDashboard />
          </AppLayout>
        } />

        {/* Incidents */}
        <Route path="/first_responder/incidents" element={
          <AppLayout>
            <Incidents />
          </AppLayout>
        } />

        {/* Resources */}
        <Route path="/first_responder/resources" element={
          <AppLayout>
            <Resources />
          </AppLayout>
        } />

        {/* Teams */}
        <Route path="/first_responder/teams" element={
          <AppLayout>
            <Teams />
          </AppLayout>
        } />

        {/* Communication */}
        <Route path="/first_responder/communication" element={
          <AppLayout>
            <CommunicationHub />
          </AppLayout>
        } />

        {/* Analytics (Coming Soon) */}
        <Route path="/first_responder/analytics" element={
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
              <p className="text-gray-600">Analytics page - Coming soon</p>
            </div>
          </AppLayout>
        } />


        {/* Government Dashboard (index) */}
      <Route path="/government" element={
        <AppLayout>
          <GovernmentDashboard />
        </AppLayout>
      } />

      {/* Overview */}
      <Route path="/government/overview" element={
        <AppLayout>
          <GovernmentOverview />
        </AppLayout>
      } />

      {/* Resources */}
      <Route path="/government/resources" element={
        <AppLayout>
          <GovernmentResources />
        </AppLayout>
      } />

      {/* Reports */}
      <Route path="/government/reports" element={
        <AppLayout>
          <GovernmentReports />
        </AppLayout>
      } />

      {/* Analytics (Coming Soon) */}
      <Route path="/government/analytics" element={
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
            <p className="text-gray-600">Analytics page - Coming soon</p>
          </div>
        </AppLayout>
      } />

      {/* Policies (Coming Soon) */}
      <Route path="/government/policies" element={
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Policies</h1>
            <p className="text-gray-600">Policies page - Coming soon</p>
          </div>
        </AppLayout>
      } />

        {/* Volunteer Dashboard (index) */}
        
        

        {/* User Dashboard (index) */}
        <Route path="/user" element={
          <AppLayout>
            <UserDashboard />
          </AppLayout>
        } />

        {/* EmergencyReports */}
        <Route path="/user/reports" element={
          <AppLayout>
            <EmergencyReports />
          </AppLayout>
        } />

        {/* UserResources */}
        <Route path="/user/resources" element={
          <AppLayout>
            <UserResources />
          </AppLayout>
        } />

        {/* CommunicationHub */}
        <Route path="/user/communication" element={
          <AppLayout>
            <CommunicationHub />
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
