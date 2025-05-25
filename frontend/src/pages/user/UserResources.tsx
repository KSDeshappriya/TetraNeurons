import React from 'react';
import { 
  Building, 
  Package, 
  Heart, 
  PhoneCall, 
  Bus, 
  BookOpen,
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  Phone,
  Info,
  AlertTriangle,
  Flame,
  ArrowRight,
  Camera,
  Cloud,
  Wind
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link, useLocation } from 'react-router-dom';

interface ResourceItem {
  id: string;
  type: 'shelter' | 'supply' | 'medical' | 'transportation';
  name: string;
  description: string;
  location: string;
  distance: number;
  status: 'open' | 'closed' | 'limited';
  hours: string;
  contact?: string;
  capacity?: {
    total: number;
    available: number;
  };
}

const UserResources: React.FC = () => {
  const location = useLocation();
  
  // Mock data for resources
  const resources: ResourceItem[] = [
    {
      id: 'shelter-001',
      type: 'shelter',
      name: 'Central Community Center',
      description: 'Emergency shelter with food, water, and basic medical supplies',
      location: '123 Main Street, Downtown',
      distance: 1.2,
      status: 'open',
      hours: '24/7 during emergency',
      capacity: {
        total: 200,
        available: 75
      }
    },
    {
      id: 'shelter-002',
      type: 'shelter',
      name: 'Westside High School',
      description: 'Temporary shelter with cots, blankets, and meals',
      location: '456 West Avenue',
      distance: 2.8,
      status: 'open',
      hours: '7:00 AM - 10:00 PM',
      capacity: {
        total: 350,
        available: 120
      }
    },
    {
      id: 'medical-001',
      type: 'medical',
      name: 'Mobile Medical Unit',
      description: 'First aid, medication refills, and basic healthcare services',
      location: 'Central Park, near entrance',
      distance: 0.5,
      status: 'open',
      hours: '8:00 AM - 6:00 PM',
      contact: '555-123-4567'
    },
    {
      id: 'supply-001',
      type: 'supply',
      name: 'Relief Supply Distribution',
      description: 'Water, non-perishable food, hygiene kits, and baby supplies',
      location: 'North Community Church',
      distance: 1.7,
      status: 'limited',
      hours: '9:00 AM - 5:00 PM',
      contact: '555-987-6543'
    },
    {
      id: 'transportation-001',
      type: 'transportation',
      name: 'Emergency Evacuation Shuttle',
      description: 'Transportation to shelters and medical facilities',
      location: 'City Hall Parking Lot',
      distance: 1.9,
      status: 'open',
      hours: '6:00 AM - 8:00 PM',
      contact: '555-789-0123'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shelter':
        return <Building className="h-6 w-6 text-primary-600" />;
      case 'supply':
        return <Package className="h-6 w-6 text-success-600" />;
      case 'medical':
        return <Heart className="h-6 w-6 text-emergency-600" />;
      case 'transportation':
        return <Bus className="h-6 w-6 text-warning-600" />;
      default:
        return <Info className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
            Open
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emergency-100 text-emergency-800 border border-emergency-200">
            Closed
          </span>
        );
      case 'limited':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
            Limited Availability
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'shelter':
        return 'Emergency Shelter';
      case 'supply':
        return 'Supply Distribution';
      case 'medical':
        return 'Medical Services';
      case 'transportation':
        return 'Transportation';
      default:
        return type;
    }
  };

  const renderCapacityBar = (total: number, available: number) => {
    const percentage = Math.floor((available / total) * 100);
    const colorClass = 
      percentage > 50 ? 'bg-success-500' :
      percentage > 25 ? 'bg-warning-500' : 'bg-emergency-500';
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">{available} spots available</span>
          <span className="text-gray-500">{total} total capacity</span>
        </div>        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${colorClass} h-2 rounded-full`}
            style={{ width: `${percentage}%` }}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          ></div>
        </div>
      </div>
    );
  };

  // Group resources by type
  const shelters = resources.filter(r => r.type === 'shelter');
  const medicalServices = resources.filter(r => r.type === 'medical');
  const supplies = resources.filter(r => r.type === 'supply');
  const transportation = resources.filter(r => r.type === 'transportation');

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <Link
              to="/user/reports"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/user/reports'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Emergency Reports
            </Link>
            <Link
              to="/user/resources"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/user/resources'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Resources
            </Link>
          </nav>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Resources</h1>
          <p className="text-gray-600 mt-1">Find shelter, supplies, and assistance during emergencies</p>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer">
            <Building className="h-10 w-10 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Shelters</h3>
            <p className="text-xs text-gray-600 text-center mt-1">{shelters.length} available</p>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer">
            <Package className="h-10 w-10 text-success-600 mb-2" />
            <h3 className="font-medium text-gray-900">Supplies</h3>
            <p className="text-xs text-gray-600 text-center mt-1">{supplies.length} available</p>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer">
            <Heart className="h-10 w-10 text-emergency-600 mb-2" />
            <h3 className="font-medium text-gray-900">Medical</h3>
            <p className="text-xs text-gray-600 text-center mt-1">{medicalServices.length} available</p>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer">
            <PhoneCall className="h-10 w-10 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Contacts</h3>
            <p className="text-xs text-gray-600 text-center mt-1">Emergency numbers</p>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer">
            <Bus className="h-10 w-10 text-warning-600 mb-2" />
            <h3 className="font-medium text-gray-900">Transportation</h3>
            <p className="text-xs text-gray-600 text-center mt-1">{transportation.length} available</p>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer">
            <BookOpen className="h-10 w-10 text-gray-600 mb-2" />
            <h3 className="font-medium text-gray-900">Guides</h3>
            <p className="text-xs text-gray-600 text-center mt-1">Safety information</p>
          </Card>
        </div>

        {/* Current Emergency Alert */}
        <div className="p-4 bg-emergency-50 border border-emergency-200 rounded-lg mb-6 flex items-start">
          <AlertTriangle className="h-6 w-6 text-emergency-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-emergency-800">Active Flood Emergency</h3>
            <p className="text-sm text-emergency-700 mt-1">Resources are being mobilized for flood response in the Downtown and Riverside areas. If you are in these areas, please consider evacuation or moving to higher ground.</p>
            <div className="mt-3">
              <Button
                variant="emergency"
                size="sm"
                leftIcon={<Phone />}
              >
                Call Emergency Services
              </Button>
            </div>
          </div>
        </div>
        
        {/* Resources Near You */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources Near You</h2>
        <div className="space-y-4 mb-8">
          {resources.map(resource => (
            <Card key={resource.id} className="transition-shadow hover:shadow-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-12 flex items-center justify-center">
                  {getTypeIcon(resource.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(resource.type)}</span>
                        {getStatusBadge(resource.status)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{resource.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                      <span>{resource.location}</span>
                      <span className="ml-1 text-gray-500">({resource.distance} miles)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                      <span>{resource.hours}</span>
                    </div>
                    {resource.contact && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                        <span>{resource.contact}</span>
                      </div>
                    )}
                  </div>
                  
                  {resource.capacity && renderCapacityBar(resource.capacity.total, resource.capacity.available)}
                  
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Navigation />}
                    >
                      Get Directions
                    </Button>
                    
                    <Button
                      variant={resource.type === 'medical' ? 'emergency' : 'primary'}
                      size="sm"
                      leftIcon={resource.type === 'shelter' ? <Building /> : (resource.type === 'medical' ? <Heart /> : <ExternalLink />)}
                    >
                      {resource.type === 'shelter' ? 'Reserve Spot' : 
                       resource.type === 'medical' ? 'Request Assistance' :
                       resource.type === 'supply' ? 'Request Supplies' :
                       resource.type === 'transportation' ? 'Schedule Pickup' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
          {/* Safety Guides */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-40 bg-primary-100 flex items-center justify-center">
              <Cloud className="h-16 w-16 text-primary-600" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">Flood Safety Guide</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">Learn how to prepare for and respond to flooding emergencies.</p>
              <Link to="/user/resources/guides/flood" className="text-primary-600 text-sm font-medium flex items-center">
                Read Guide
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-40 bg-emergency-100 flex items-center justify-center">
              <Flame className="h-16 w-16 text-emergency-600" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">Fire Emergency Guide</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">Essential tips for fire safety and evacuation procedures.</p>
              <Link to="/user/resources/guides/fire" className="text-primary-600 text-sm font-medium flex items-center">
                Read Guide
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-40 bg-warning-100 flex items-center justify-center">
              <Wind className="h-16 w-16 text-warning-600" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">Storm Preparedness</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">How to prepare for and stay safe during severe storms.</p>
              <Link to="/user/resources/guides/storm" className="text-primary-600 text-sm font-medium flex items-center">
                Read Guide
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <Heart className="h-16 w-16 text-emergency-600" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">First Aid Basics</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">Essential first aid skills for emergency situations.</p>
              <Link to="/user/resources/guides/firstaid" className="text-primary-600 text-sm font-medium flex items-center">
                Read Guide
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserResources;
