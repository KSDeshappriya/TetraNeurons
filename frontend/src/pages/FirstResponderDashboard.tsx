import React from 'react';
import { authService } from '../services/auth';

const FirstResponderDashboard: React.FC = () => {
  const token = authService.getTokenPayload();
  return (
    <div>
      <h1>First Responder Dashboard</h1>
      <p>Hi {token?.name} ({token?.email})</p>
      <p>Role: {token?.role}</p>
    </div>
  );
};

export default FirstResponderDashboard;
