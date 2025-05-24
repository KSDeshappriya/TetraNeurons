import React, { useState } from 'react';
import { AlertTriangle, MapPin, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { authService } from '../../lib/auth';

interface DisasterData {
  id: string;
  type: string;
  status: string;
  affectedAreas: number;
  peopleAffected: number;
  resourcesDeployed: number;
  responseTeams: number;
  startDate: string;
  trend: 'improving' | 'worsening' | 'stable';
}

interface RegionStatistics {
  region: string;
  activeCases: number;
  trend: number;
  isPositive: boolean;
}

const GovernmentDashboard: React.FC = () => {
  const token = authService.getTokenPayload();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'resources'>('overview');
  
  // Mock data
  const activeDisasters: DisasterData[] = [
    {
      id: 'DIS-2023-001',
      type: 'Flooding',
      status: 'Active',
      affectedAreas: 5,
      peopleAffected: 3500,
      resourcesDeployed: 45,
      responseTeams: 12,
      startDate: '3 days ago',
      trend: 'improving'
    },
    {
      id: 'DIS-2023-002',
      type: 'Wildfire',
      status: 'Contained',
      affectedAreas: 3,
      peopleAffected: 850,
      resourcesDeployed: 28,
      responseTeams: 8,
      startDate: '5 days ago',
      trend: 'improving'
    },
    {
      id: 'DIS-2023-003',
      type: 'Earthquake',
      status: 'Active',
      affectedAreas: 7,
      peopleAffected: 12000,
      resourcesDeployed: 102,
      responseTeams: 24,
      startDate: '1 day ago',
      trend: 'worsening'
    }
  ];

  const regionStats: RegionStatistics[] = [
    { region: 'Northern District', activeCases: 14, trend: 8, isPositive: false },
    { region: 'Central Metropolis', activeCases: 23, trend: 12, isPositive: false },
    { region: 'Eastern Coastal Zone', activeCases: 8, trend: 5, isPositive: true },
    { region: 'Western Mountains', activeCases: 5, trend: 1, isPositive: true },
    { region: 'Southern Agricultural Belt', activeCases: 11, trend: 3, isPositive: true }
  ];

  const resourceStats = {
    total: 450,
    deployed: 175,
    available: 275
  };

  const responseStats = {
    teams: 45,
    personnel: 380,
    averageResponseTime: '18 min'
  };
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {token?.name}</h1>
        <p className="text-gray-600 mt-1">Government Operations Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Emergencies" 
          value={activeDisasters.filter(d => d.status === 'Active').length} 
          icon={AlertTriangle}
          variant="emergency"
        />
        <StatCard 
          title="Affected Areas" 
          value={activeDisasters.reduce((sum, disaster) => sum + disaster.affectedAreas, 0)} 
          icon={MapPin}
          variant="warning"
        />
        <StatCard 
          title="Deployed Resources" 
          value={activeDisasters.reduce((sum, disaster) => sum + disaster.resourcesDeployed, 0)} 
          icon={Users}
          variant="info"
        />
        <StatCard 
          title="Response Teams" 
          value={activeDisasters.reduce((sum, disaster) => sum + disaster.responseTeams, 0)} 
          icon={Users}
          variant="success"
        />
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resources
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Emergency Alerts */}
            {activeDisasters.filter(d => d.status === 'Active').length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Active Emergency Situations!</strong>
                <span className="block sm:inline"> There are ongoing emergency situations requiring immediate attention.</span>
              </div>
            )}

            {/* Area Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regionStats.map((region) => (
                <Card key={region.region} className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{region.region}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${region.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {region.isPositive ? 'Stable' : 'Critical'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">Active Cases: {region.activeCases}</p>
                      <p className="text-gray-600">Trend: 
                        <span className={`font-medium 
                          ${region.trend > 0 ? 'text-green-600' : region.trend < 0 ? 'text-red-600' : 'text-gray-600'}
                        `}>
                          {region.trend > 0 ? `+${region.trend}%` : `${region.trend}%`}
                        </span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">View Details</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {activeDisasters.map((disaster) => (
              <Card key={disaster.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{disaster.type} Report</h3>
                      <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${disaster.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                    `}>
                      {disaster.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    This report provides an overview of the {disaster.type} situation, including affected areas, resources deployed, and response teams.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">Download PDF</Button>
                    <Button variant="outline" size="sm">Share Report</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            {regionStats.map((region) => (
              <Card key={region.region} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{region.region} Resources</h3>
                      <p className="text-sm text-gray-500">As of {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${region.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    `}>
                      {region.isPositive ? 'Stable' : 'Critical'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Resources</p>
                      <p className="text-gray-900">{resourceStats.total} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Resources Deployed</p>
                      <p className="text-gray-900">{resourceStats.deployed} units</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">Allocate Resources</Button>
                    <Button variant="outline" size="sm">View Resource Map</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentDashboard;
