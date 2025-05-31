import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  MapPin, 
  MessageSquare, 
  BarChart3,
  ArrowRight,
  Globe,
  Clock,
  UserCheck
} from 'lucide-react';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/signin');
  };

  const features = [
    {
      icon: Shield,
      title: "Emergency Response",
      description: "Real-time emergency reporting and response coordination system"
    },
    {
      icon: Users,
      title: "Team Coordination",
      description: "Connect volunteers, first responders, and government agencies"
    },
    {
      icon: MapPin,
      title: "Location-Based Services",
      description: "GPS-enabled emergency reporting and resource allocation"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Seamless communication between all disaster response teams"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Data-driven insights for better disaster management"
    },
    {
      icon: Clock,
      title: "24/7 Monitoring",
      description: "Round-the-clock disaster monitoring and alert system"
    }
  ];

  const roles = [
    {
      icon: UserCheck,
      title: "Citizens",
      description: "Report emergencies and access safety resources",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Volunteers",
      description: "Coordinate relief efforts and community support",
      color: "bg-green-500"
    },
    {
      icon: Shield,
      title: "First Responders",
      description: "Manage incidents and coordinate emergency response",
      color: "bg-red-500"
    },
    {
      icon: Globe,
      title: "Government",
      description: "Monitor overview and allocate resources effectively",
      color: "bg-purple-500"
    }
  ];
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`${styles.headerBackground} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TetraNeurons</h1>
                <p className="text-sm text-blue-100">Disaster Response Coordination</p>
              </div>
            </div>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </header>      {/* Hero Section */}
      <section className={`${styles.heroBackground} py-20 px-4 sm:px-6 lg:px-8`}>
        <div className={`${styles.overlay} max-w-7xl mx-auto text-center`}>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AI-Powered
            <span className="text-blue-200 block">Disaster Response</span>
            <span className="text-blue-100">Coordination</span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect communities, coordinate resources, and save lives through intelligent 
            disaster management and emergency response systems powered by artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              Explore System
              <ArrowRight className="ml-3 h-5 w-5" />
            </button>
            
          </div>
        </div>
      </section>      {/* Features Section */}
      <section className={`${styles.featuresBackground} py-20`}>
        <div className={`${styles.overlay} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              Comprehensive Disaster Management
            </h3>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Our platform provides end-to-end disaster response capabilities,
              from early warning systems to post-disaster recovery coordination.
            </p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-20">
                <div className="w-12 h-12 bg-blue-200 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-200" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Everyone in Emergency Response
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a citizen, volunteer, first responder, or government official, 
              our platform has the tools you need to make a difference.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center mb-4`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h4>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Emergency Response?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of communities already using our platform to coordinate 
            disaster response and save lives.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            Start Exploring Now
            <ArrowRight className="ml-3 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">TetraNeurons</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-Powered Disaster Response Coordination Platform
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 TetraNeurons. Built for emergency response and disaster management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
