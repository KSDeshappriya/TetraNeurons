import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { authService } from '../../lib/auth';
import Footer from '../../components/layout/Footer';
import NavigationBar from '../../components/layout/Navigationbar';


interface DisasterData {
  id: string;
  type: string;
  peopleAffected: number;
  resourcesDeployed: number;
  responseTeams: number;
  startDate?: Date; // changed from string to Date and made optional for pending
  trend: 'improving' | 'worsening' | 'stable';
  status: 'Active' | 'Pending' | 'Resolved';
  longitude: number;
  latitude: number;
  urgencyLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  requestDate?: string;
  resolvedDate?: Date; // changed from string to Date
  location?: string;
}

const VolDashboard: React.FC = () => {
  const token = authService.getTokenPayload();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'archive'>('active');
  const showMap = true; 
  
  // Mock data for active disasters
  const activeDisasters: DisasterData[] = [
    {
      id: 'DIS-2023-001',
      type: 'Flooding',
      status: 'Active',
      peopleAffected: 3500,
      resourcesDeployed: 45,
      responseTeams: 12,
      trend: 'improving',
      longitude: -122.4194,
      latitude: 37.7749,
      location: 'San Francisco, CA',
      startDate: new Date('2023-05-10T08:00:00Z')
    },
  ];

  // Mock data for pending disaster requests


  const getCurrentData = () => {
    switch (activeTab) {
      case 'active': return activeDisasters;
      default: return activeDisasters;
    }
  };


  const getMarkerIcon = (status: string) => {
    let color = '#3B82F6'; // default blue
    if (status === 'Active') color = '#EF4444'; // red
    else if (status === 'Pending') color = '#F59E0B'; // orange
    else if (status === 'Resolved') color = '#10B981'; // green

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

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

          {/* Dashboard Tabs - Mobile scrollable */}
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
                  Active Disasters
                </button>
              </nav>
              
            </div>
          </div>

          {/* Map Section */}
          {showMap && (
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
                    {getCurrentData().map((disaster) => (
                      <Marker
                        key={disaster.id}
                        position={[disaster.latitude, disaster.longitude]}
                        icon={getMarkerIcon(disaster.type)}
                      >
                        <Popup>
                          <div className="text-xs sm:text-sm">
                            <h3 className="font-semibold">{disaster.type}</h3>
                            <p>ID: {disaster.id}</p>
                            <p>Location: {disaster.location}</p>
                            <p>Status: {disaster.status}</p>
                            <p>People Affected: {disaster.peopleAffected.toLocaleString()}</p>
                            {disaster.urgencyLevel && <p>Priority: {disaster.urgencyLevel}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </Card>
            </div>
          )}

          {/* Tab Content - Compact mobile design */}
          <div>
            {/* Active Disasters Tab */}
            {activeTab === 'active' && (
              <div className="space-y-3 sm:space-y-6">
                {activeDisasters.map((disaster) => (
                  <Card key={disaster.id} className="hover:shadow-md transition-shadow p-2 sm:p-3 mb-2 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <h3 className="text-xs sm:text-base font-medium text-gray-900">{disaster.type}</h3>
                        <p className="text-xs text-gray-500">{disaster.id} • {disaster.startDate ? disaster.startDate.toLocaleString() : ''}</p>
                        <p className="text-xs text-gray-400">{disaster.location}</p>
                      </div>
                      <div className="flex flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0">
                        <Button variant="outline" size="sm" className="text-xs"  onAction={`/fr/report?id=${disaster.id}`}>View Disaster</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <div>
                        <p className="text-xs text-gray-500">People</p>
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">{disaster.peopleAffected.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resources</p>
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">{disaster.resourcesDeployed}</p>
                      </div>
                    </div>
                  </Card>
                ))}
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