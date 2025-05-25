import React from 'react';
import { 
  Home,
  AlertTriangle,
  Users,
  BarChart3,
  User,
  MessageSquare,
  Settings,
  Bell,
  Shield,
  Globe,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  subItems?: { name: string; href: string; }[];
}

interface NavigationBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  notificationsOpen,
  setNotificationsOpen,
  userMenuOpen,
  setUserMenuOpen,
}) => {
  const location = useLocation();

  const getNavItems = (): NavItem[] => {
    return [
      { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: Home 
      },
      { 
        name: 'User', 
        href: '/user', 
        icon: AlertTriangle,
        subItems: [
          { name: 'Dashboard', href: '/user' },
          { name: 'Emergency Reports', href: '/user/reports' },
          { name: 'Resources', href: '/user/resources' },
          { name: 'Communication', href: '/user/communication' }
        ]
      },
      { 
        name: 'Volunteer', 
        href: '/volunteer', 
        icon: Users,
        subItems: [
          { name: 'Dashboard', href: '/volunteer' },
          { name: 'Assignments', href: '/volunteer/assignments' },
          { name: 'Resources', href: '/volunteer/resources' },
          { name: 'Communication', href: '/volunteer/communication' },
          { name: 'Training', href: '/volunteer/training' }
        ]
      },
      { 
        name: 'First Responder', 
        href: '/first_responder', 
        icon: Shield,
        subItems: [
          { name: 'Dashboard', href: '/first_responder' },
          { name: 'Incidents', href: '/first_responder/incidents' },
          { name: 'Teams', href: '/first_responder/teams' },
          { name: 'Resources', href: '/first_responder/resources' },
          { name: 'Communication', href: '/first_responder/communication' },
          { name: 'Analytics', href: '/first_responder/analytics' }
        ]
      },
      { 
        name: 'Government', 
        href: '/government', 
        icon: Globe,
        subItems: [
          { name: 'Dashboard', href: '/government' },
          { name: 'Overview', href: '/government/overview' },
          { name: 'Reports', href: '/government/reports' },
          { name: 'Resources', href: '/government/resources' },
          { name: 'Analytics', href: '/government/analytics' },
          { name: 'Policies', href: '/government/policies' }
        ]
      },
      { 
        name: 'Communication', 
        href: '/communication', 
        icon: MessageSquare 
      },
      { 
        name: 'Profile', 
        href: '/profile', 
        icon: User 
      },
      { 
        name: 'Settings', 
        href: '/settings', 
        icon: Settings 
      }
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
    <>
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

        {/* Sidebar content (for mobile/vertical)*/}
        <nav className="mt-5 px-2 space-y-1 lg:hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            return (
              <div key={item.name} className="space-y-1">
                <Link
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

                {/* Sub-items */}
                {hasSubItems && isActive && ( // Only show sub-items in vertical nav when parent is active
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={`
                          block px-3 py-2 text-sm font-medium rounded-lg
                          ${location.pathname === subItem.href
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Top navigation (for desktop/horizontal)*/}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex justify-between h-16 px-4 sm:px-6 items-center">
            <div className="flex items-center">
               {/* Logo and Title - Keep for both mobile and desktop header */}
               <div className="flex-shrink-0">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-2 text-xl font-semibold text-blue-600">TetraNeurons</div>

              {/* Horizontal navigation links (Desktop only)*/}
              <nav className="hidden lg:flex items-center space-x-4 ml-8">
                {navItems.map((item) => {
                  // Exclude items that only have sub-items if you don't want a main link for them
                  if (item.subItems && item.href === item.subItems[0].href) {
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`
                            px-3 py-2 text-sm font-medium rounded-md
                            ${location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      );
                  }
                   // Render main links for items without sub-items or with different main href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-md
                        ${location.pathname === item.href
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
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
      </div>
    </>
  );
};

export default NavigationBar;
