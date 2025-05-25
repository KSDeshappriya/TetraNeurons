import React, { useState } from 'react';
import { AlertTriangle,Users, Download, Clock, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
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

const GovernmentDashboard: React.FC = () => {
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
    {
      id: 'DIS-2023-002',
      type: 'Wildfire',
      status: 'Active',
      peopleAffected: 850,
      resourcesDeployed: 28,
      responseTeams: 8,
      trend: 'improving',
      longitude: -118.2437,
      latitude: 34.0522,
      location: 'Los Angeles, CA',
      startDate: new Date('2023-05-12T10:00:00Z')
    },
    {
      id: 'DIS-2023-003',
      type: 'Earthquake',
      status: 'Active',
      peopleAffected: 12000,
      resourcesDeployed: 102,
      responseTeams: 24,
      trend: 'worsening',
      longitude: -121.4944,
      latitude: 38.5816,
      location: 'Sacramento, CA',
      startDate: new Date('2023-05-15T14:00:00Z')
    }
  ];

  // Mock data for pending disaster requests
  const pendingDisasters: DisasterData[] = [
    {
      id: 'REQ-2023-008',
      type: 'Storm',
      status: 'Pending',
      peopleAffected: 1200,
      resourcesDeployed: 0,
      responseTeams: 0,
      requestDate: '2 hours ago',
      urgencyLevel: 'Critical',
      trend: 'stable',
      longitude: -95.3698,
      latitude: 29.7604,
      location: 'Houston, TX'
    },
    {
      id: 'REQ-2023-009',
      type: 'Landslide',
      status: 'Pending',
      peopleAffected: 300,
      resourcesDeployed: 0,
      responseTeams: 0,
      requestDate: '4 hours ago',
      urgencyLevel: 'High',
      trend: 'stable',
      longitude: -87.6298,
      latitude: 41.8781,
      location: 'Chicago, IL'
    },
    {
      id: 'REQ-2023-010',
      type: 'Flooding',
      status: 'Pending',
      peopleAffected: 500,
      resourcesDeployed: 0,
      responseTeams: 0,
      requestDate: '1 day ago',
      urgencyLevel: 'Medium',
      trend: 'stable',
      longitude: -104.9903,
      latitude: 39.7392,
      location: 'Denver, CO'
    }
  ];

  // Mock data for archived disasters
  const archivedDisasters: DisasterData[] = [
    {
      id: 'DIS-2023-004',
      type: 'Hurricane',
      status: 'Resolved',
      peopleAffected: 25000,
      resourcesDeployed: 250,
      responseTeams: 45,
      startDate: new Date('2023-05-01T09:00:00Z'),
      resolvedDate: new Date('2023-05-08T18:00:00Z'),
      trend: 'stable',
      longitude: -80.1918,
      latitude: 25.7617,
      location: 'Miami, FL'
    },
    {
      id: 'DIS-2023-005',
      type: 'Tornado',
      status: 'Resolved',
      peopleAffected: 800,
      resourcesDeployed: 35,
      responseTeams: 12,
      startDate: new Date('2023-04-20T11:00:00Z'),
      resolvedDate: new Date('2023-04-27T16:00:00Z'),
      trend: 'stable',
      longitude: -97.5164,
      latitude: 35.4676,
      location: 'Oklahoma City, OK'
    }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'active': return activeDisasters;
      case 'pending': return pendingDisasters;
      case 'archive': return archivedDisasters;
      default: return activeDisasters;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'bg-green-100 text-green-800';
      case 'worsening': return 'bg-red-100 text-red-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Government Operations Dashboard</p>
          </div>

          {/* Quick Stats - Mobile responsive grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <StatCard 
              title="Active Disasters" 
              value={activeDisasters.length} 
              icon={AlertTriangle}
              variant="emergency"
            />
            <StatCard 
              title="Pending Requests" 
              value={pendingDisasters.length} 
              icon={Clock}
              variant="warning"
            />
            <StatCard 
              title="Resources Deployed" 
              value={activeDisasters.reduce((sum, disaster) => sum + disaster.resourcesDeployed, 0)} 
              icon={Users}
              variant="info"
            />
            <StatCard 
              title="Resolved This Month" 
              value={archivedDisasters.length} 
              icon={CheckCircle}
              variant="success"
            />
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
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'pending' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending Requests
                </button>
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'archive' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Archive
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(disaster.trend)}`}>{disaster.trend.charAt(0).toUpperCase() + disaster.trend.slice(1)}</span>
                        <Button variant="outline" size="sm" className="text-xs" onAction={`/gov/resource`}>Allocate Resources</Button>
                        <Button variant="outline" size="sm" className="text-xs"  onAction={`/gov/report?id=${disaster.id}`}>View Disaster</Button>
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

            {/* Pending Disaster Requests Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-3 sm:space-y-6">
                {pendingDisasters.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow p-2 sm:p-3 mb-2 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <h3 className="text-xs sm:text-base font-medium text-gray-900">{request.type} Request</h3>
                        <p className="text-xs text-gray-500">{request.id} • {request.requestDate}</p>
                        <p className="text-xs text-gray-400">{request.location}</p>
                      </div>
                      <div className="flex flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgencyLevel || 'Medium')}`}>{request.urgencyLevel} Priority</span>
                        <Button onAction="/gov/request" variant="primary" size="sm" className="text-xs">View More Details</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Est. People Affected</p>
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">{request.peopleAffected.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Urgency Level</p>
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">{request.urgencyLevel}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Archive Tab */}
            {activeTab === 'archive' && (
              <div className="space-y-3 sm:space-y-6">
                {archivedDisasters.map((disaster) => (
                  <Card key={disaster.id} className="hover:shadow-md transition-shadow p-2 sm:p-3 mb-2 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <h3 className="text-xs sm:text-base font-medium text-gray-900">{disaster.type}</h3>
                        <p className="text-xs text-gray-500">{disaster.id} • {disaster.startDate ? disaster.startDate.toLocaleString() : ''} - {disaster.resolvedDate ? disaster.resolvedDate.toLocaleString() : ''}</p>
                        <p className="text-xs text-gray-400">{disaster.location}</p>
                      </div>
                      <div className="flex flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Resolved</span>
                        <Button variant="outline" size="sm" className="text-xs"><Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />Download Report</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <div>
                        <p className="text-xs text-gray-500">People Affected</p>
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">{disaster.peopleAffected.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resources Used</p>
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

export default GovernmentDashboard;