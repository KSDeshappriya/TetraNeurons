import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  Shield,
  Globe,
  MessageSquare,
  Settings
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: { name: string; href: string; }[];
}

const NavigationBar: React.FC = () => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'User',
      href: '/user',
      icon: User,
      subItems: [
        { name: 'Dashboard', href: '/user' },
        { name: 'Emergency Reports', href: '/user/reports' },
        { name: 'Resources', href: '/user/resources' }
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
        { name: 'Resources', href: '/first_responder/resources' }
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
        { name: 'Resources', href: '/government/resources' }
      ]
    },
    {
      name: 'Communication',
      href: '/communication',
      icon: MessageSquare
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200">
      {/* TetraNeurons Logo/Header */}
      <div className="flex items-center px-6 h-16 border-b border-gray-200">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <span className="ml-2 text-xl font-semibold text-blue-600">TetraNeurons</span>
      </div>

      {/* Navigation Items */}
      <nav className="mt-5 px-4 space-y-1">
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
              {hasSubItems && isActive && (
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
  );
};

export default NavigationBar;