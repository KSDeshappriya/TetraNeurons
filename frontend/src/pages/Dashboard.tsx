import React from 'react';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  MapPin, 
  MessageSquare, 
  BarChart3,
  Home,
  User,
  Settings,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const dashboardCards = [
    {
      title: "User Dashboard",
      description: "Citizen emergency reporting and safety resources",
      icon: User,
      path: "/user",
      color: "bg-blue-500",
      features: ["Emergency Reports", "Safety Resources", "Community Alerts"]
    },
    {
      title: "Volunteer Dashboard",
      description: "Coordinate relief efforts and community support",
      icon: Users,
      path: "/volunteer",
      color: "bg-green-500",
      features: ["Assignments", "Resources", "Community Support"]
    },
    {
      title: "First Responder Dashboard",
      description: "Manage incidents and emergency response",
      icon: Shield,
      path: "/first_responder",
      color: "bg-red-500",
      features: ["Active Incidents", "Resources", "Team Management"]
    },
    {
      title: "Government Dashboard",
      description: "Monitor overview and resource allocation",
      icon: Globe,
      path: "/government",
      color: "bg-purple-500",
      features: ["Overview", "Resources", "Reports"]
    }
  ];

  const quickStats = [
    { label: "Active Incidents", value: "23", icon: AlertTriangle, color: "text-red-600" },
    { label: "Available Volunteers", value: "156", icon: Users, color: "text-green-600" },
    { label: "Response Teams", value: "12", icon: Shield, color: "text-blue-600" },
    { label: "Reports Today", value: "8", icon: BarChart3, color: "text-purple-600" }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "emergency",
      title: "Flood Report - Downtown Area",
      time: "5 minutes ago",
      status: "Active"
    },
    {
      id: 2,
      type: "volunteer",
      title: "Medical Team Deployed",
      time: "15 minutes ago",
      status: "In Progress"
    },
    {
      id: 3,
      type: "resource",
      title: "Emergency Supplies Delivered",
      time: "1 hour ago",
      status: "Completed"
    },
    {
      id: 4,
      type: "alert",
      title: "Weather Warning Issued",
      time: "2 hours ago",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">TetraNeurons</h1>
                  <p className="text-sm text-gray-600">Disaster Response Coordination</p>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/communication" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Communication
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
              <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">System Dashboard</h2>
          <p className="text-gray-600">
            Access all disaster response coordination modules and monitoring tools
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {dashboardCards.map((card, index) => (
            <Link
              key={index}
              to={card.path}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 ${card.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{card.description}</p>
                  <div className="space-y-1">
                    {card.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activities and System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'emergency' ? 'bg-red-500' :
                      activity.type === 'volunteer' ? 'bg-green-500' :
                      activity.type === 'resource' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'Active' ? 'bg-red-100 text-red-800' :
                    activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">System Health</span>
                </div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Last Updated</span>
                </div>
                <span className="text-sm font-medium text-gray-900">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Communication</span>
                </div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">GPS Services</span>
                </div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
