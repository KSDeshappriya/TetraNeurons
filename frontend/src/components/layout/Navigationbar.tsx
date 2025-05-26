import React, { useEffect, useState } from 'react';
import {
  Home,
  MessageSquare,
  Bell,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { authService} from '../../services/auth';
import type { UserRole, } from '../../services/auth';


const NavigationBar: React.FC = () => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('User');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    // Get user info from token
    const tokenPayload = authService.getTokenPayload();
    if (tokenPayload) {
      setUserName(tokenPayload.name || 'User');
      setUserRole(tokenPayload.role);
    }
  }, []);

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['user', 'volunteer', 'first_responder', 'government'] as UserRole[],
      },
      {
        name: 'Communication',
        href: '/communication',
        icon: MessageSquare,
        roles: ['user', 'volunteer', 'first_responder', 'government'] as UserRole[],
      },
    ];

    

    const allItems = [...baseItems, ];
    
    // Filter items based on user role
    return allItems.filter(item => 
      !userRole || item.roles.includes(userRole)
    );
  };

  const navItems = getNavItems();

  // Handle role-based dashboard redirect
  const getDashboardUrl = () => {
    switch (userRole) {
      case 'government':
        return '/government';
      case 'first_responder':
        return '/responder';
      case 'volunteer':
        return '/volunteer';
      default:
        return '/user';
    }
  };

  // Close sidebar when clicking outside
  const handleBackdropClick = () => {
    setSidebarOpen(false);
  };

  // Prevent event bubbling when clicking inside sidebar
  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out lg:hidden
        `}
        style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        onClick={handleSidebarClick}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200 bg-white">
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-2 text-lg font-semibold text-blue-600 truncate">TetraNeurons</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 flex-shrink-0"
            title="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col h-full bg-white">
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {/* Always show Dashboard and Communication in mobile */}
            <Link
              to={getDashboardUrl()}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${(location.pathname.startsWith('/dashboard') || location.pathname === '/dashboard')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Home 
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  (location.pathname.startsWith('/dashboard') || location.pathname === '/dashboard')
                    ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`} 
              />
              Dashboard
            </Link>

            <Link
              to="/communication"
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${(location.pathname.startsWith('/communication') || location.pathname === '/communication')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <MessageSquare 
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  (location.pathname.startsWith('/communication') || location.pathname === '/communication')
                    ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`} 
              />
              Communication
            </Link>

            {/* Additional role-based items */}
            {navItems.slice(2).map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info in sidebar */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`}
                alt="User Avatar"
                className="h-8 w-8 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation (desktop/horizontal) */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10 relative mb-3">
          <div className="flex justify-between h-16 px-4 sm:px-6 items-center">
            <div className="flex items-center">
              {/* Hamburger menu for mobile */}
              <button
                className="lg:hidden p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setSidebarOpen(true)}
                title="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo and Title */}
              <Link to={getDashboardUrl()} className="flex items-center min-w-0">
                <div className="flex-shrink-0">
                  <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="ml-1.5 sm:ml-2 text-base sm:text-xl font-semibold text-blue-600 truncate">
                  <span className="hidden xs:inline">TetraNeurons</span>
                  <span className="xs:hidden">TetraNeurons</span>
                </div>
              </Link>

              {/* Desktop nav links */}
              <nav className="hidden lg:flex items-center space-x-1 ml-4 xl:ml-8">
                {/* Always show Dashboard and Communication */}
                <Link
                  to={getDashboardUrl()}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${(location.pathname.startsWith('/dashboard') || location.pathname === '/dashboard')
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Home className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  to="/communication"
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${(location.pathname.startsWith('/communication') || location.pathname === '/communication')
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Communication
                </Link>

                {/* Additional role-based items */}
                {navItems.slice(2).map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isActive 
                          ? 'text-blue-700 bg-blue-50' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className="mr-1.5 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side navigation items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative transition-colors"
                  title="View notifications"
                >
                  <Bell className="h-6 w-6" />
                  {/* Notification dot */}
                  <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {/* Notification dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p className="text-sm">No notifications</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <Link
                  to="/private/profile"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Profile"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="hidden sm:block">
                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                    <p className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};

export default NavigationBar;