import React, { useState, useEffect } from 'react';
import {
  Building, Package, Heart, PhoneCall, Bus, BookOpen,
  MapPin, Clock, Users, Phone, Info, Loader, Camera
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
const useLocation = () => ({
  search: window.location.search
});
import Footer from '../../components/layout/Footer';
import { fetchALLDisasterData } from '../../services/check_users';
import NavigationBar from '../../components/layout/Navigationbar';
import { 
  getResourcesByDisaster, 
} from '../../services/check_resource';

interface ResourceItem {
  id: string;
  type: 'shelter' | 'supply' | 'medical' 
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  distance?: number;
  status: string;
  hours: string;
  contact?: string;
  capacity?: { total: number; available: number; };
}

interface DisasterData {
  ai_processing_time: number;
  citizen_survival_guide: string;
  created_at: number;
  disaster_id: string;
  emergency_type: string;
  geohash: string;
  government_report: string;
  image_url: string;
  latitude: number;
  longitude: number;
  people_count: string;
  situation: string;
  status: string;
  submitted_time: number;
  urgency_level: string;
  user_id: string;
}

interface EmergencyContact {
  uid: string;
  name: string;
  phone: string;
  description: string;
  longitude: number;
  latitude: number;
  role: string;
}

const VolResources: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const disasterId = searchParams.get('id');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [disasterData, setDisasterData] = useState<DisasterData | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch disaster data and nearby responders
  useEffect(() => {
    fetchALLDisasterData(disasterId, setDisasterData, setEmergencyContacts, setError, setLoading);
  }, [disasterId]);

  useEffect(() => {
    if (!disasterId) return;
    getResourcesByDisaster(disasterId)
      .then(setResources)
      .catch((err) => {
        console.error("Failed to fetch resources:", err);
        setError("Failed to load resource data.");
      });
  }, [disasterId]);

  // Redirect if no disaster ID
  if (!disasterId) {
    window.history.back();
    return null;
  }


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
      description: `${emergencyContacts.length} available`,
    },
    {
      id: 'Tasks',
      label: 'Tasks',
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading disaster information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emergency Resources</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Type - {disasterData?.emergency_type} 
            </p>
          </div>

          {/* Resource Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {resourceCategories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer rounded-lg border-2 ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-transparent bg-white'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon className={`h-8 w-8 sm:h-10 sm:w-10 mb-2 ${cat.iconClass}`} />
                  <h3 className="font-medium text-gray-900 text-xs sm:text-sm text-center">{cat.label}</h3>
                  <p className="text-xs text-gray-600 text-center mt-1 hidden sm:block">{cat.description}</p>
                  <p className="text-xs text-gray-600 text-center mt-1 sm:hidden">
                    {cat.description.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Map */}
          {((!['insights'].includes(selectedCategory) && filteredResources.length > 0) || selectedCategory === 'contacts') && (
            <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden border border-gray-200" style={{ height: '300px', minHeight: '250px' }}>
              <MapContainer
                center={
                  selectedCategory === 'contacts'
                    ? [disasterData?.latitude || 40.7128, disasterData?.longitude || -74.0060]
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
                {selectedCategory === 'contacts'
                  ? emergencyContacts.map(contact => (
                    <Marker key={contact.uid} position={[contact.latitude, contact.longitude]}>
                      <Popup>
                        <div>
                          <strong>{contact.name}</strong><br />
                          {contact.description}<br />
                          <span>Role: {contact.role}</span><br />
                          <span>Phone: <a href={`tel:${contact.phone}`}>{contact.phone}</a></span>
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

          {/* Content based on selected category */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {selectedCategory === 'all' ? 'All Resources Near You' : `${resourceCategories.find(c => c.id === selectedCategory)?.label} Near You`}
          </h2>

          {selectedCategory === 'contacts' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="font-medium text-gray-900 mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                {emergencyContacts.map(contact => (
                  <div key={contact.uid} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.description}</div>
                      <div className="text-xs text-gray-500 capitalize">{contact.role}</div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className={`px-3 sm:px-4 py-2 rounded-md font-mono hover:opacity-80 transition-colors flex items-center justify-center text-white text-sm ${contact.role === 'emergency' ? 'bg-red-600' :
                          contact.role === 'first_responder' ? 'bg-blue-600' : 'bg-green-600'
                        }`}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedCategory === 'Tasks' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="font-medium text-gray-900 mb-4">Tasks</h3>
              <div className="py-2 border rounded-lg bg-white shadow-sm mb-6">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request & Contact Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Emergency Type</label>
                        <p className="text-gray-900 capitalize">{disasterData?.emergency_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Urgency Level</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium `}>
                          {disasterData?.urgency_level}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">People Count</label>
                      <div className="flex items-center mt-1">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-gray-900">{disasterData?.people_count} people affected</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Situation Description</label>
                      <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                        {disasterData?.situation}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Submitted By</label>
                        <p className="text-gray-900 text-sm break-all">User ID: {disasterData?.user_id}</p>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>

              {disasterData?.image_url && (
                <div className="py-2 border rounded-lg bg-white shadow-sm mb-6">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      Submitted Evidence
                    </h3>
                    <div className="relative">
                      <img
                        src={disasterData?.image_url}
                        alt="Emergency evidence"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              )}
              
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
                  <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{resource.name}</h3>
                                {getStatusBadge(resource.status)}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                            </div>
                            
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                              <span>{resource.distance} miles away</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                              <span>{resource.hours}</span>
                            </div>
                            {resource.contact && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                                <a href={`tel:${resource.contact}`} className="underline text-blue-600 hover:text-blue-800 break-all">{resource.contact}</a>
                              </div>
                            )}
                          </div>

                          {resource.capacity && renderCapacityBar(resource.capacity.total, resource.capacity.available)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredResources.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No {selectedCategory === 'all' ? '' : selectedCategory} resources available in your area.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <Footer />
      </div>

    </>
  );
};

export default VolResources;