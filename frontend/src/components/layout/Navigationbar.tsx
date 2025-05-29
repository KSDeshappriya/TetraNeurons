import React, { useEffect, useState } from 'react';
import { Home, MessageSquare, Shield, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { authService } from '../../services/auth';
import type { UserRole } from '../../services/auth';

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('User');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tokenPayload = authService.getTokenPayload();
    if (tokenPayload) {
      setUserName(tokenPayload.name || 'User');
      setUserRole(tokenPayload.role);
    }
  }, []);

  // Check if should show communication (URL: /report?id={some id})
  const shouldShowCommunication = () => {
    const { pathname, search } = location;
    if (pathname.endsWith('/report') && search) {
      const reportId = new URLSearchParams(search).get('id');
      return reportId !== null && reportId.trim() !== '';
    }
    return false;
  };

  const getReportId = () => new URLSearchParams(location.search).get('id');



  // Handle communication click with location check
  const handleCommunicationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const reportId = getReportId();
    if (!reportId) return;
    window.location.href = `/private/CommunicationHub?reportId=${reportId}`;
  };

  const getDashboardUrl = () => {
    switch (userRole) {
      case 'government': return '/government';
      case 'first_responder': return '/responder';
      case 'volunteer': return '/volunteer';
      default: return '/user';
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-3 border-b">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="ml-2 text-lg font-semibold text-blue-600">TetraNeurons</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1">
          <Link to={getDashboardUrl()} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setSidebarOpen(false)}>
            <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Dashboard
          </Link>

          {shouldShowCommunication() && (
            <a href="#" onClick={handleCommunicationClick} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50">
              <MessageSquare className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Communication
            </a>
          )}
        </nav>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 mb-3">
        <div className="flex justify-between h-16 px-4 sm:px-6 items-center">
          <div className="flex items-center">
            <button className="lg:hidden p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-md" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>

            <Link to={getDashboardUrl()} className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-1.5 sm:ml-2 text-base sm:text-xl font-semibold text-blue-600">TetraNeurons</div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center space-x-1 ml-8">
              <Link to={getDashboardUrl()} className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                <Home className="mr-1.5 h-4 w-4" />
                Dashboard
              </Link>

              {shouldShowCommunication() && (
                <a href="#" onClick={handleCommunicationClick} className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Communication
                </a>
              )}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Link to="/private/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`} alt="Avatar" className="h-8 w-8 rounded-full" />
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <p className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</p>
              </div>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavigationBar;