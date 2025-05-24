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
import { Link, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  const getNavItems = () => {
    return [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Emergency Reports', href: '/user/reports', icon: AlertTriangle },
      { name: 'Volunteers', href: '/volunteer', icon: Users },
      { name: 'First Responders', href: '/first_responder', icon: Shield },
      { name: 'Government', href: '/government', icon: Globe },
      { name: 'Resources', href: '/user/resources', icon: BarChart3 },
      { name: 'Communication', href: '/communication', icon: MessageSquare },
      { name: 'Profile', href: '/profile', icon: User },
      { name: 'Settings', href: '/settings', icon: Settings }
    ];
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
      time: '2 hours ago',
      type: 'assignment'
    }
  ];

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
        transition-transform duration-300 ease-in-out lg:hidden
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-2 text-xl font-semibold text-blue-600">TetraNeurons</div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1"
            title="Close sidebar"
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
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
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
          <div className="flex justify-between h-16 px-4 sm:px-6 items-center">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
                title="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Disaster Response Dashboard
                </h1>
              </div>
              {/* Horizontal navigation for desktop */}
              <nav className="hidden lg:flex flex-row items-center space-x-2 ml-8">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className={`
                        mr-2 h-5 w-5 flex-shrink-0
                        ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
                      `} />
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
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
                  title="View notifications"
                >
                  <Bell className="h-6 w-6" />
                  {mockNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
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
                              <span className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${
                                notification.type === 'emergency' ? 'bg-red-100 text-red-800' : 
                                notification.type === 'assignment' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
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
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                >
                  <img 
                    src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                    alt="User Avatar" 
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">User</span>
                </Link>
              </div>

              {/* Home button */}
              <Link 
                to="/"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                title="Go to home"
              >
                <Home className="h-6 w-6" />
              </Link>
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
