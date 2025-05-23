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

const App: React.FC = () => {
  return (
        <Routes>

          <Route path="/public/*" element={
            <PublicRoute>
              <div className="p-4">
                <h1 className="text-2xl">Public Area</h1>
                <p>Accessible to everyone</p>
              </div>
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
              <div className="p-4">
                <h1 className="text-2xl">User Dashboard</h1>
                <p>Accessible to users</p>
              </div>
            </UserRoute>
          } />

          <Route path="/volunteer/*" element={
            <VolunteerRoute>
              <div className="p-4">
                <h1 className="text-2xl">Volunteer Dashboard</h1>
                <p>Accessible to volunteers</p>
              </div>
            </VolunteerRoute>
          } />

          <Route path="/first_responder/*" element={
            <FirstResponderRoute>
              <div className="p-4">
                <h1 className="text-2xl">First Responder Dashboard</h1>
                <p>Accessible to first responders</p>
              </div>
            </FirstResponderRoute>
          } />

          <Route path="/government/*" element={
            <GovernmentRoute>
              <div className="p-4">
                <h1 className="text-2xl">Government Dashboard</h1>
                <p>Accessible to government officials</p>
              </div>
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