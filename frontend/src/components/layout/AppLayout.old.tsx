import React, { useState } from 'react';
import { 
  Menu,
  X,
  Home,
  AlertTriangle,
  Users,
  BarChart3,
  User,
  MessageSquare,
  Settings,
  Bell,
  Shield,
  Globe
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    const items = [
      { name: 'Dashboard', href: `/${userRole}`, icon: Home },
    ];

    // Add role-specific nav items
    switch (userRole) {
      case 'user':
        items.push(
          { name: 'Emergency Reports', href: '/user/reports', icon: AlertTriangle },
          { name: 'Safety Resources', href: '/user/resources', icon: Users }
        );
        break;
      case 'volunteer':
        items.push(
          { name: 'Assignments', href: '/volunteer/assignments', icon: AlertTriangle },
          { name: 'Resources', href: '/volunteer/resources', icon: BarChart3 }
        );
        break;
      case 'first_responder':
        items.push(
          { name: 'Active Incidents', href: '/first_responder/incidents', icon: AlertTriangle },
          { name: 'Resources', href: '/first_responder/resources', icon: BarChart3 },
          { name: 'Teams', href: '/first_responder/teams', icon: Users }
        );
        break;
      case 'government':
        items.push(
          { name: 'Overview', href: '/government/overview', icon: BarChart3 },
          { name: 'Resources', href: '/government/resources', icon: Users },
          { name: 'Reports', href: '/government/reports', icon: AlertTriangle }
        );
        break;
    }

    // Common items for all roles
    items.push(
      { name: 'Messages', href: `/${userRole}/messages`, icon: MessageSquare },
      { name: 'Profile', href: '/private/profile', icon: User },
      { name: 'Settings', href: `/${userRole}/settings`, icon: Settings }
    );

    return items;
  };

  const navItems = getNavItems();

  const mockNotifications = [
    {
      id: 1,
      title: 'New emergency report nearby',
      description: 'Flooding reported 0.5 miles from your location',
      time: '5 minutes ago',
      type: 'emergency'
    },
    {
      id: 2,
      title: 'Status update',
      description: 'Your last report has been reviewed by authorities',
      time: '1 hour ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'New assignment',
      description: 'You have been assigned to help with evacuation',
      time: '3 hours ago',
      type: 'task'
    }
  ];

  // Get avatar from user info or generate a placeholder
  const getUserAvatar = () => {
    if (userInfo?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=0D8ABC&color=fff`;
    }
    return 'https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src="/disaster-response-logo.png" 
                alt="TetraNeurons" 
                className="h-8 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/32x32/0D8ABC/FFFFFF?text=TN';
                }}
              />
            </div>
            <div className="ml-2 text-xl font-semibold text-primary-600">TetraNeurons</div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Sidebar content */}
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-600'}
                `} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {userRole === 'first_responder' ? 'First Responder' : 
                    userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
                </h1>
              </div>
            </div>

            {/* Right side navigation items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
                >
                  <Bell className="h-6 w-6" />
                  {mockNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-emergency-500 ring-2 ring-white"></span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.length > 0 ? (
                        mockNotifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              <span className={`ml-2 flex-shrink-0 badge ${
                                notification.type === 'emergency' ? 'badge-emergency' : 
                                notification.type === 'task' ? 'badge-warning' : 'badge-info'
                              }`}>
                                {notification.type}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                    {mockNotifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-200">
                        <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                >
                  <img 
                    src={getUserAvatar()}
                    alt="User Avatar" 
                    className="h-8 w-8 rounded-full"
                  />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userInfo?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{userInfo?.email || 'user@example.com'}</p>
                    </div>
                    <Link 
                      to="/private/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to={`/${userRole}/settings`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4 text-gray-500" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} TetraNeurons - AI-Powered Disaster Response Coordination
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
