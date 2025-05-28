import React, { useState,useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { authService } from '../../lib/auth';
import Footer from '../../components/layout/Footer';
import NavigationBar from '../../components/layout/Navigationbar';
import { getItemsFirebase } from '../../services/check_disaster';
import { AlertTriangle,CheckCircle } from 'lucide-react';


interface DisasterData {
  uniqueId: string;
  data: {
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
  };
}

const VolDashboard: React.FC = () => {
   const token = authService.getTokenPayload();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'archive'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showMap = true;
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
 const [activeDisasters, setActiveDisasters] = useState<DisasterData[]>([]);


  const getCurrentData = () => {
    switch (activeTab) {
      case 'active': return activeDisasters;
      default: return activeDisasters;
    }
  };

  useEffect(() => {
      const fetchDisasterData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const items: DisasterData[] = await getItemsFirebase();
          
          // Filter and categorize disasters based on status
          const active: DisasterData[] = [];
          const pending: DisasterData[] = [];
          const archived: DisasterData[] = [];
  
          items.forEach((disaster) => {
            const status = disaster.data.status.toLowerCase();
            
            switch (status) {
              case 'active':
              case 'ongoing':
              case 'in progress':
                active.push(disaster);
                break;
              case 'pending':
              case 'review':
              case 'submitted':
                pending.push(disaster);
                break;
              case 'resolved':
              case 'completed':
              case 'closed':
              case 'archive':
              case 'archived':
                archived.push(disaster);
                break;
              default:
                // If status is unclear, categorize based on other factors
                if (disaster.data.urgency_level === 'Critical' || disaster.data.urgency_level === 'High') {
                  active.push(disaster);
                } else {
                  pending.push(disaster);
                }
            }
          });setActiveDisasters(active);
        
      } catch (error) {
        console.error("Error fetching disaster data:", error);
        setError("Failed to load disaster data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDisasterData();
  }, []);



  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  

  const getMarkerIcon = (status: string) => {
    let color = '#3B82F6'; // default blue
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'active' || statusLower === 'ongoing' || statusLower === 'in progress') {
      color = '#EF4444'; // red
    } else if (statusLower === 'pending' || statusLower === 'review' || statusLower === 'submitted') {
      color = '#F59E0B'; // orange
    } else if (statusLower === 'resolved' || statusLower === 'completed' || statusLower === 'closed') {
      color = '#10B981'; // green
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading disaster data...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }



  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50">
        {/* Centered Container with side margins */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {token?.name}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Volunteer Operations Dashboard</p>
          </div>

           {/* Dashboard Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'active' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Active Disasters ({activeDisasters.length})
                </button>
               
              </nav>
            </div>
          </div>

          {/* Map Section */}
          {showMap && getCurrentData().length > 0 && (
            <div className="mb-6">
              <Card className="p-0 overflow-hidden">
                <div className="h-64 sm:h-96">
                  <MapContainer
                    center={[39.8283, -98.5795]} // Center of US
                    zoom={4}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <TileLayer
                                      url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                                      attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                                      opacity={0.6}
                                    />
                    {getCurrentData().map((disaster) => (
                      <Marker
                        key={disaster.uniqueId}
                        position={[disaster.data.latitude, disaster.data.longitude]}
                        icon={getMarkerIcon(disaster.data.status)}
                      >
                        <Popup>
                          <div className="text-xs sm:text-sm">
                            <h3 className="font-semibold">{disaster.data.emergency_type}</h3>
                            <p>ID: {disaster.data.disaster_id}</p>
                            <p>Status: {disaster.data.status}</p>
                            <p>People Affected: {disaster.data.people_count}</p>
                            <p>Priority: {disaster.data.urgency_level}</p>
                            <p>Situation: {disaster.data.situation}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </Card>
            </div>
          )}

          {/* Tab Content */}
          <div>
            {/* Active Disasters Tab */}
            {activeTab === 'active' && (
              <div className="space-y-3 sm:space-y-6">
                {activeDisasters.length === 0 ? (
                  <Card className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No active disasters at the moment.</p>
                  </Card>
                ) : (
                  activeDisasters.map((disaster) => (
                    <Card key={disaster.uniqueId} className="hover:shadow-md transition-shadow p-2 sm:p-3 mb-2 sm:mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3">
                        <div>
                          <h3 className="text-xs sm:text-base font-medium text-gray-900">{disaster.data.emergency_type}</h3>
                          <p className="text-xs text-gray-500">{disaster.data.disaster_id} • {formatDate(disaster.data.created_at)}</p>
                          <p className="text-xs text-gray-400">Lat: {disaster.data.latitude}, Lng: {disaster.data.longitude}</p>
                        </div>
                        <div className="flex flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium `}>
                            {disaster.data.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(disaster.data.urgency_level)}`}>
                            {disaster.data.urgency_level}
                          </span>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => window.location.href = `/vol/report?id=${disaster.data.disaster_id}`}>
                            View Details
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 mb-2 sm:mb-3">
                        <div>
                          <p className="text-xs text-gray-500">People Affected</p>
                          <p className="text-xs sm:text-sm text-gray-900 font-medium">{disaster.data.people_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Urgency</p>
                          <p className="text-xs sm:text-sm text-gray-900 font-medium">{disaster.data.urgency_level}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Situation</p>
                          <p className="text-xs sm:text-sm text-gray-900">{disaster.data.situation}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VolDashboard;