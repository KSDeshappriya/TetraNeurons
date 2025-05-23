import { Routes, Route, Navigate } from 'react-router';
import SignIn from './pages/signin';
import SignUp from './pages/signup';
import Unauthorized from './pages/Unauthorized';
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
import UserDashboard from './pages/UserDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import FirstResponderDashboard from './pages/FirstResponderDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import VideoFrameGrid from './components/VideoFrameGrid';

const App: React.FC = () => {
  return (
        <Routes>
          <Route path="/public/*" element={
            <PublicRoute>
              <VideoFrameGrid />
            </PublicRoute>
          } />

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

          <Route path="/user/*" element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } />

          <Route path="/volunteer/*" element={
            <VolunteerRoute>
              <VolunteerDashboard />
            </VolunteerRoute>
          } />

          <Route path="/first_responder/*" element={
            <FirstResponderRoute>
              <FirstResponderDashboard />
            </FirstResponderRoute>
          } />

          <Route path="/government/*" element={
            <GovernmentRoute>
              <GovernmentDashboard />
            </GovernmentRoute>
          } />

          <Route path="/private/*" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={<Navigate to="/public" replace />} />
          
          <Route path="*" element={<Navigate to="/public" replace />} />
        </Routes>
  );
};

export default App;