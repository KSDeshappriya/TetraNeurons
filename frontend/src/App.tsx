import { Routes, Route } from 'react-router';
import { Navigate } from 'react-router';
import SignIn from './pages/auth/signin';
import SignUp from './pages/auth/signup';
import Unauthorized from './pages/auth/Unauthorized';
import { 
  AuthRoute, 
  PublicRoute, 
  UserRoute, 
  VolunteerRoute, 
  FirstResponderRoute, 
  GovernmentRoute, 
  PrivateRoute 
} from './components/ProtectedRoute';
import Profile from './pages/profile';
import UserDashboard from './pages/dashboards/UserDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import FirstResponderDashboard from './pages/dashboards/FirstResponderDashboard';
import GovernmentDashboard from './pages/dashboards/GovernmentDashboard';
import Home from './pages/Home';
import UserResources from './pages/user/UserResources';
import EmergencyRequestReview from './pages/government/Goverment_Requests';
import GovResources from './pages/government/Government_Reports';
import ResourceAddingPage from './pages/government/Government_Resources';
import FRResources from './pages/first_responder/first_responder_Resources';
import VolResources from './pages/volunteer/VolunteerResources';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/public/*" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />

      {/* Auth Routes */}
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

      {/* User Routes - Short URLs */}
      <Route path="/user" element={
        <UserRoute>
          <UserDashboard />
        </UserRoute>
      } />
      <Route path="/user/report" element={
        <UserRoute>
          <UserResources />
        </UserRoute>
      } />

      {/* Government Routes - Short URLs */}
      <Route path="/gov" element={
        <GovernmentRoute>
          <GovernmentDashboard />
        </GovernmentRoute>
      } />
      <Route path="/gov/request" element={
        <GovernmentRoute>
          <EmergencyRequestReview />
        </GovernmentRoute>
      } />
      <Route path="/gov/report" element={
        <GovernmentRoute>
          <GovResources />
        </GovernmentRoute>
      } />
      <Route path="/gov/resource" element={
        <GovernmentRoute>
          <ResourceAddingPage />
        </GovernmentRoute>
      } />

      {/* First Responder Routes - Short URLs */}
      <Route path="/fr" element={
        <FirstResponderRoute>
          <FirstResponderDashboard />
        </FirstResponderRoute>
      } />
      <Route path="/fr/report" element={
        <FirstResponderRoute>
          <FRResources />
        </FirstResponderRoute>
      } />

      {/* Volunteer Routes - Short URLs */}
      <Route path="/vol" element={
        <VolunteerRoute>
          <VolunteerDashboard />
        </VolunteerRoute>
      } />
      <Route path="/vol/report" element={
        <VolunteerRoute>
          <VolResources />
        </VolunteerRoute>
      } />

      {/* Private/Profile Routes */}
      <Route path="/private/*" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      {/* Long URL Redirects - Redirect to short URLs */}
      <Route path="/government/*" element={<Navigate to="/gov" replace />} />
      <Route path="/first_responder/*" element={<Navigate to="/fr" replace />} />
      <Route path="/volunteer/*" element={<Navigate to="/vol" replace />} />
      <Route path="/user/*" element={<Navigate to="/user" replace />} />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/public" replace />} />
      <Route path="*" element={<Navigate to="/public" replace />} />
    </Routes>
  );
};

export default App;