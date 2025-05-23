import { Routes, Route,  } from 'react-router';
// import { Navigate } from 'react-router';
import SignIn from './pages/auth/signin';
import SignUp from './pages/auth/signup';
import Unauthorized from './pages/auth/Unauthorized';
// import { 
//   AuthRoute, 
//   PublicRoute, 
//   UserRoute, 
//   VolunteerRoute, 
//   FirstResponderRoute, 
//   GovernmentRoute, 
//   PrivateRoute 
// } from './components/ProtectedRoute';
import Profile from './pages/profile';
import UserDashboard from './pages/dashboards/UserDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import FirstResponderDashboard from './pages/dashboards/FirstResponderDashboard';
import GovernmentDashboard from './pages/dashboards/GovernmentDashboard';
import VideoFrameGrid from './components/VideoFrameGrid';

const App: React.FC = () => {
  return (
        // <Routes>
        //   <Route path="/public/*" element={
        //     <PublicRoute>
        //       <VideoFrameGrid />
        //     </PublicRoute>
        //   } />

        //   <Route path="/auth/signin" element={
        //     <AuthRoute>
        //       <SignIn />
        //     </AuthRoute>
        //   } />
        //   <Route path="/auth/signup" element={
        //     <AuthRoute>
        //       <SignUp />
        //     </AuthRoute>
        //   } />

        //   <Route path="/user/*" element={
        //     <UserRoute>
        //       <UserDashboard />
        //     </UserRoute>
        //   } />

        //   <Route path="/volunteer/*" element={
        //     <VolunteerRoute>
        //       <VolunteerDashboard />
        //     </VolunteerRoute>
        //   } />

        //   <Route path="/first_responder/*" element={
        //     <FirstResponderRoute>
        //       <FirstResponderDashboard />
        //     </FirstResponderRoute>
        //   } />

        //   <Route path="/government/*" element={
        //     <GovernmentRoute>
        //       <GovernmentDashboard />
        //     </GovernmentRoute>
        //   } />

        //   <Route path="/private/*" element={
        //     <PrivateRoute>
        //       <Profile />
        //     </PrivateRoute>
        //   } />

        //   <Route path="/unauthorized" element={<Unauthorized />} />
          
        //   <Route path="/" element={<Navigate to="/public" replace />} />
          
        //   <Route path="*" element={<Navigate to="/public" replace />} />
        // </Routes>
        <Routes>
      <Route path="/public/*" element={<VideoFrameGrid />} />
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/user/*" element={<UserDashboard />} />
      <Route path="/volunteer/*" element={<VolunteerDashboard />} />
      <Route path="/first_responder/*" element={<FirstResponderDashboard />} />
      <Route path="/government/*" element={<GovernmentDashboard />} />
      <Route path="/private/*" element={<Profile />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* <Route path="/" element={<Navigate to="/public" replace />} />
      <Route path="*" element={<Navigate to="/public" replace />} /> */}
    </Routes>
  );
};

export default App;