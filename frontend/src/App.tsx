import { Routes, Route,  } from 'react-router';
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
import FRDashboard from './pages/dashboards/FirstResponderDashboard';
import FRResources from './pages/first_responder/first_responder_Resources';
import VolResources from './pages/volunteer/VolunteerResources';

const App: React.FC = () => {
  return (
        <Routes>
          <Route path="/public/*" element={
            <PublicRoute>
              <Home />
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

          {/* Additional protected routes restored from comments */}
          <Route path="/user/report" element={
            <UserRoute>
              <UserResources />
            </UserRoute>
          } />

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

          <Route path="/fr" element={
            <FirstResponderRoute>
              <FRDashboard />
            </FirstResponderRoute>
          } />
          <Route path="/fr/report" element={
            <FirstResponderRoute>
              <FRResources />
            </FirstResponderRoute>
          } />

          <Route path="/vol" element={
            <VolunteerRoute>
              <VolunteerDashboard />
            </VolunteerRoute>
          } />

           <Route path="/vol" element={
            <VolunteerRoute>
              <VolResources />
            </VolunteerRoute>
          } />
        </Routes>
  );
};

export default App;