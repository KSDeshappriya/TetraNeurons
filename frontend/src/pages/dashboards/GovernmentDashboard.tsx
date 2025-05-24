import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { 
  AlertTriangle, 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp,
  TrendingDown,
  Truck,
  StethoscopeIcon,
  Building,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';

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
  const [activePeriod, setActivePeriod] = useState<'day' | 'week' | 'month'>('week');
  
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
        <h1 className="text-2xl font-bold text-gray-900">Government Help Centre</h1>
        <p className="text-gray-600 mt-1">Disaster Coordination Dashboard</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Disasters" 
          value={activeDisasters.filter(d => d.status === 'Active').length} 
          icon={AlertTriangle}
          variant="emergency"
          change={{ 
            value: 20, 
            isPositive: false 
          }}
          footer="20% increase from last week"
        />
        <StatCard 
          title="People Affected" 
          value={activeDisasters.reduce((sum, disaster) => sum + disaster.peopleAffected, 0).toLocaleString()} 
          icon={Users}
          variant="info"
          change={{ 
            value: 15, 
            isPositive: false 
          }}
          footer="15% increase from last week"
        />
        <StatCard 
          title="Resources Deployed" 
          value={activeDisasters.reduce((sum, disaster) => sum + disaster.resourcesDeployed, 0)} 
          icon={Truck}
          variant="warning"
          change={{ 
            value: 32, 
            isPositive: false 
          }}
          footer="32% increase from last week"
        />
        <StatCard 
          title="Response Teams" 
          value={activeDisasters.reduce((sum, disaster) => sum + disaster.responseTeams, 0)} 
          icon={Users}
          variant="success"
          change={{ 
            value: 25, 
            isPositive: false 
          }}
          footer="25% increase from last week"
        />
      </div>

      {/* Active Disasters */}
      <Card 
        title="Active Disasters" 
        subtitle="Current ongoing disaster events"
        headerAction={
          <Button 
            variant="outline" 
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View All
          </Button>
        }
        className="mb-8"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Areas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeDisasters.map((disaster) => (
                <tr key={disaster.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{disaster.type}</div>
                    <div className="text-xs text-gray-500">{disaster.id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {disaster.startDate}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium
                      ${disaster.status === 'Active'
                        ? 'bg-emergency-100 text-emergency-800'
                        : disaster.status === 'Contained'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-success-100 text-success-800'
                      }`}
                    >
                      {disaster.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {disaster.affectedAreas}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {disaster.peopleAffected.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {disaster.resourcesDeployed}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {disaster.responseTeams}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {disaster.trend === 'improving' ? (
                      <div className="flex items-center text-success-600">
                        <TrendingDown className="h-5 w-5 mr-1" />
                        <span className="text-xs font-medium">Improving</span>
                      </div>
                    ) : disaster.trend === 'worsening' ? (
                      <div className="flex items-center text-emergency-600">
                        <TrendingUp className="h-5 w-5 mr-1" />
                        <span className="text-xs font-medium">Worsening</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <span className="text-xs font-medium">Stable</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Regional Overview & Resource Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card 
          title="Regional Overview" 
          subtitle="Emergency cases by region"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {regionStats.map((region) => (
              <div key={region.region} className="flex items-center">
                <div className="w-36 text-sm font-medium text-gray-900 truncate">
                  {region.region}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(5, region.activeCases * 4))}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium text-gray-900">
                  {region.activeCases} cases
                </div>
                <div className="w-16 text-right">
                  <span className={`flex items-center justify-end text-xs ${region.isPositive ? 'text-success-600' : 'text-emergency-600'}`}>
                    {region.isPositive ? (
                      <>
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {region.trend}%
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {region.trend}%
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Resource Allocation" 
          subtitle="Current deployment status"
        >
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Resources Deployed</span>
              <span className="text-sm font-medium text-gray-900">{Math.round((resourceStats.deployed / resourceStats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${(resourceStats.deployed / resourceStats.total) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Total Resources</div>
                <div className="text-sm text-gray-600">{resourceStats.total} units</div>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Personnel Available</div>
                <div className="text-sm text-gray-600">{responseStats.personnel} people</div>
              </div>
            </div>
            <div className="flex items-center">
              <StethoscopeIcon className="h-5 w-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Average Response Time</div>
                <div className="text-sm text-gray-600">{responseStats.averageResponseTime}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Response Activity Chart */}
      <Card 
        title="Response Activity" 
        subtitle="Activity trends for response operations"
        headerAction={
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-xs rounded-md ${activePeriod === 'day' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActivePeriod('day')}
            >
              Day
            </button>
            <button 
              className={`px-3 py-1 text-xs rounded-md ${activePeriod === 'week' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActivePeriod('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 text-xs rounded-md ${activePeriod === 'month' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActivePeriod('month')}
            >
              Month
            </button>
          </div>
        }
      >
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-gray-500 flex flex-col items-center">
            <BarChart3 className="h-16 w-16 mb-2 text-gray-300" />
            <p>Response activity chart would display here</p>
            <p className="text-sm">Based on {activePeriod} period</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GovernmentDashboard;
