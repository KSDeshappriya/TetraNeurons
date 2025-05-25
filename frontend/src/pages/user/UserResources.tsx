import React, { useState } from 'react';
import { 
  Building, Package, Heart, PhoneCall, Bus, BookOpen,
  MapPin, Clock,  Navigation, Phone, Info
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Footer from '../../components/layout/Footer';
import NavigationBar from '../../components/layout/Navigationbar';
import { useLocation } from 'react-router-dom';


interface ResourceItem {
  id: string;
  type: 'shelter' | 'supply' | 'medical' | 'transportation';
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  distance: number;
  status: 'open' | 'closed' | 'limited';
  hours: string;
  contact?: string;
  capacity?: { total: number; available: number; };
}

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  longitude: number;
  latitude: number;
  role: string; // Added role property
}

const UserResources: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const Param = searchParams.get('id');
  if(Param == null){
    window.history.back()
  }
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Mock data - expanded for demonstration
  const resources: ResourceItem[] = [
    {
      id: 'shelter-001',
      type: 'shelter',
      name: 'Central Community Center',
      description: 'Emergency shelter with food, water, and basic medical supplies',
      longitude: 40.7128,
      latitude: -74.0060,
      distance: 1.2,
      status: 'open',
      hours: '24/7 during emergency',
      capacity: { total: 200, available: 75 }
    },

  ];

  const emergencyContacts: EmergencyContact[] = [
    {
      id: 'emergency-911',
      name: 'Emergency Services',
      number: '911',
      description: 'Police, Fire, Medical Emergency',
      longitude: 40.7128,
      latitude: -74.0060,
      role: 'emergency', // Added role value
    },
  ];

  // Resource category data for concise mapping
  const resourceCategories = [
    {
      id: 'shelter',
      label: 'Shelters',
      icon: Building,
      iconClass: 'text-primary-600',
      description: `${resources.filter(r => r.type === 'shelter').length} available`,
    },
    {
      id: 'supply',
      label: 'Supplies',
      icon: Package,
      iconClass: 'text-success-600',
      description: `${resources.filter(r => r.type === 'supply').length} available`,
    },
    {
      id: 'medical',
      label: 'Medical',
      icon: Heart,
      iconClass: 'text-emergency-600',
      description: `${resources.filter(r => r.type === 'medical').length} available`,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: PhoneCall,
      iconClass: 'text-primary-600',
      description: 'Emergency numbers',
    },
    {
      id: 'AI Insights',
      label: 'AI Insights',
      icon: BookOpen,
      iconClass: 'text-gray-600',
      description: 'Safety information',
    },
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.type === selectedCategory);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-red-100 text-red-800 border-red-200',
      limited: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderCapacityBar = (total: number, available: number) => {
    const percentage = Math.floor((available / total) * 100);
    const colorClass = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
    

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">{available} spots available</span>
          <span className="text-gray-500">{total} total capacity</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <>
    <NavigationBar />
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Resources</h1>
          <p className="text-gray-600 mt-1">Find shelter, supplies, and assistance during emergencies</p>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {resourceCategories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer rounded-lg border-2 ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-transparent bg-white'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon className={`h-10 w-10 mb-2 ${cat.iconClass}`} />
                <h3 className="font-medium text-gray-900">{cat.label}</h3>
                <p className="text-xs text-gray-600 text-center mt-1">{cat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Big Map for resources (not for guides/contacts) */}
        {((!['guides'].includes(selectedCategory) && filteredResources.length > 0) || selectedCategory === 'contacts') && (
          <div className="mb-8 rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
            <MapContainer
              center={
                selectedCategory === 'contacts'
                  ? [
                      emergencyContacts.reduce((sum, c) => sum + c.latitude, 0) / emergencyContacts.length,
                      emergencyContacts.reduce((sum, c) => sum + c.longitude, 0) / emergencyContacts.length
                    ]
                  : [
                      filteredResources.reduce((sum, r) => sum + r.latitude, 0) / filteredResources.length,
                      filteredResources.reduce((sum, r) => sum + r.longitude, 0) / filteredResources.length
                    ]
              }
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Weather overlay tile layer (OpenWeatherMap) */}
              <TileLayer
                attribution='Weather data © <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHERMAP_API_KEY`}
                opacity={0.5}
              />
              {selectedCategory === 'contacts'
                ? emergencyContacts.map(contact => (
                    <Marker key={contact.id} position={[contact.latitude, contact.longitude]}>
                      <Popup>
                        <div>
                          <strong>{contact.name}</strong><br />
                          {contact.description}<br />
                          <span>Role: {contact.role}</span><br />
                          <span>Phone: <a href={`tel:${contact.number}`}>{contact.number}</a></span>
                        </div>
                      </Popup>
                    </Marker>
                  ))
                : filteredResources.map(resource => (
                    <Marker key={resource.id} position={[resource.latitude, resource.longitude]}>
                      <Popup>
                        <div>
                          <strong>{resource.name}</strong><br />
                          {resource.description}<br />
                          {resource.contact && (
                            <span>Phone: <a href={`tel:${resource.contact}`}>{resource.contact}</a><br /></span>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
            </MapContainer>
          </div>
        )}

        {/* Resources */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'All Resources Near You' : `${resourceCategories.find(c => c.id === selectedCategory)?.label} Near You`}
        </h2>

        {selectedCategory === 'contacts' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">All Emergency Contact Numbers</h3>
            <div>
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.description}</div>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-mono hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {contact.number.startsWith('+1') ? contact.number.replace('+1', '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : contact.number}
                  </a>
                </div>
              ))}
               </div>
          </div>
        ) : selectedCategory === 'Insights' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map(resource => {
              const typeIcons = {
                shelter: Building,
                supply: Package,
                medical: Heart,
                transportation: Bus
              };
              const Icon = typeIcons[resource.type] || Info;
              
              return (
                <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-12 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                            {getStatusBadge(resource.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{resource.distance} miles away</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{resource.hours}</span>
                        </div>
                        {resource.contact && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            <a href={`tel:${resource.contact}`} className="underline text-blue-600 hover:text-blue-800">{resource.contact}</a>
                          </div>
                        )}
                      </div>
                      
                      {resource.capacity && renderCapacityBar(resource.capacity.total, resource.capacity.available)}
                      
                      <div className="flex gap-3 mt-4">
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </button>
                        
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                          resource.type === 'medical' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          <Icon className="h-4 w-4 mr-2" />
                          {resource.type === 'shelter' ? 'Reserve Spot' : 
                           resource.type === 'medical' ? 'Request Assistance' :
                           resource.type === 'supply' ? 'Request Supplies' :
                           'Schedule Pickup'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredResources.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No {selectedCategory} resources available in your area.</p>
              </div>
            )}
            <Footer />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default UserResources;