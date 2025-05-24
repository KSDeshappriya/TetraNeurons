import React, { useState } from 'react';
import { BarChart3, FileText, Users, AlertTriangle, Map, TrendingUp, ChevronDown, Info, MapPin, Calendar, Search, Compass, ArrowUpRight, ChartPie, Clock, Building, HelpCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import Alert from '../../components/ui/Alert';
import Select from '../../components/ui/Select';

interface DisasterSummary {
  type: string;
  count: number;
  trend: number;
  color: string;
}

interface RegionStatus {
  id: string;
  name: string;
  status: 'critical' | 'warning' | 'stable' | 'recovering';
  activeCrisis: number;
  population: number;
  affectedPercent: number;
  responseUnits: number;
  activeIncidents: {
    title: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
  }[];
}

const mockDisasterSummary: DisasterSummary[] = [
  { type: 'Flood', count: 12, trend: 33, color: 'bg-blue-500' },
  { type: 'Fire', count: 8, trend: -15, color: 'bg-red-500' },
  { type: 'Storm', count: 5, trend: 20, color: 'bg-indigo-500' },
  { type: 'Earthquake', count: 2, trend: 0, color: 'bg-amber-500' },
  { type: 'Industrial', count: 3, trend: 50, color: 'bg-purple-500' }
];

const mockRegionData: RegionStatus[] = [
  {
    id: 'REG-001',
    name: 'Northern District',
    status: 'critical',
    activeCrisis: 4,
    population: 450000,
    affectedPercent: 15,
    responseUnits: 25,
    activeIncidents: [
      { title: 'Major Flooding on Riverside', type: 'Flood', severity: 'high' },
      { title: 'Power Outage in Northern Sector', type: 'Infrastructure', severity: 'medium' }
    ]
  },
  {
    id: 'REG-002',
    name: 'Central Business District',
    status: 'warning',
    activeCrisis: 2,
    population: 380000,
    affectedPercent: 8,
    responseUnits: 18,
    activeIncidents: [
      { title: 'Gas Leak in Commercial Building', type: 'Hazmat', severity: 'high' }
    ]
  },
  {
    id: 'REG-003',
    name: 'Eastern Suburbs',
    status: 'stable',
    activeCrisis: 1,
    population: 310000,
    affectedPercent: 2,
    responseUnits: 5,
    activeIncidents: [
      { title: 'Medical Emergency at Community Center', type: 'Medical', severity: 'medium' }
    ]
  },
  {
    id: 'REG-004',
    name: 'Southern Coastal Region',
    status: 'recovering',
    activeCrisis: 2,
    population: 270000,
    affectedPercent: 10,
    responseUnits: 12,
    activeIncidents: [
      { title: 'Storm Damage Assessment', type: 'Storm', severity: 'medium' }
    ]
  },
  {
    id: 'REG-005',
    name: 'Western Highlands',
    status: 'stable',
    activeCrisis: 0,
    population: 180000,
    affectedPercent: 0,
    responseUnits: 3,
    activeIncidents: []
  }
];

const Overview: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedRegion, setSelectedRegion] = useState<RegionStatus | null>(null);

  // Summary statistics
  const totalIncidents = mockRegionData.reduce((acc, region) => acc + region.activeCrisis, 0);
  const totalAffected = mockRegionData.reduce((acc, region) => 
    acc + Math.round(region.population * (region.affectedPercent / 100)), 0);
  const totalResponseUnits = mockRegionData.reduce((acc, region) => acc + region.responseUnits, 0);
  
  const criticalRegions = mockRegionData.filter(region => region.status === 'critical').length;
  const warningRegions = mockRegionData.filter(region => region.status === 'warning').length;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-emergency-600 bg-emergency-100';
      case 'warning':
        return 'text-warning-600 bg-warning-100';
      case 'stable':
        return 'text-success-600 bg-success-100';
      case 'recovering':
        return 'text-info-600 bg-info-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusImpact = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Severe impact - Immediate action required';
      case 'warning':
        return 'Significant impact - Monitoring closely';
      case 'stable':
        return 'Minimal impact - Situation under control';
      case 'recovering':
        return 'Improving conditions - Recovery in progress';
      default:
        return 'Unknown status';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emergency-100 text-emergency-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-info-100 text-info-800">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const timeRangeOptions = [
    { value: '24hours', label: 'Last 24 Hours' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disaster Response Overview</h1>
        <p className="text-gray-600 mt-1">Comprehensive view of active disasters and response efforts</p>
      </div>

      {/* Alert for urgent action */}
      <Alert 
        type="emergency"
        title="Urgent: Northern District Critical Situation"
        message="Major flooding affecting 67,500 people. Additional resources and coordination needed immediately."
        className="mb-6"
      />

      {/* Time range selector */}
      <div className="flex justify-end mb-6">
        <div className="w-48">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={timeRangeOptions}
            label="Time Range"
          />
        </div>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Active Incidents"
          value={totalIncidents}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={5}
          trendLabel="from last week"
          trendType="up"
          bgColor="bg-emergency-50"
          iconColor="text-emergency-600"
        />
        <StatCard 
          title="People Affected"
          value={totalAffected.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          trend={12}
          trendLabel="from last week"
          trendType="up"
          bgColor="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard 
          title="Response Units Deployed"
          value={totalResponseUnits}
          icon={<Building className="h-6 w-6" />}
          trend={8}
          trendLabel="from last week"
          trendType="up"
          bgColor="bg-secondary-50"
          iconColor="text-secondary-600"
        />
      </div>

      {/* Incident Map */}
      <Card className="mb-6">
        <div className="p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Incident Map</h2>
            <Button
              variant="outline"
              onClick={() => {}}
              className="flex items-center mt-2 sm:mt-0"
            >
              <Map className="mr-2 h-4 w-4" />
              Open Full Map
            </Button>
          </div>
          
          <div className="bg-gray-200 rounded-lg w-full h-[400px] flex items-center justify-center mb-4 relative">
            <div className="text-center">
              <Map className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interactive disaster map loading...</p>
              <p className="text-gray-500 text-sm">View all active incidents across regions</p>
            </div>
            
            {/* Map overlay for demo - would be replaced with actual interactive map */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-emergency-500 mr-2"></div>
                    <span className="text-xs">Critical</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-warning-500 mr-2"></div>
                    <span className="text-xs">Warning</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-info-500 mr-2"></div>
                    <span className="text-xs">Recovering</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-success-500 mr-2"></div>
                    <span className="text-xs">Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-emergency-50 rounded-lg">
              <p className="text-sm font-medium text-emergency-800">{criticalRegions}</p>
              <p className="text-xs text-emergency-600">Critical Regions</p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <p className="text-sm font-medium text-warning-800">{warningRegions}</p>
              <p className="text-xs text-warning-600">Warning Regions</p>
            </div>
            <div className="p-3 bg-info-50 rounded-lg">
              <p className="text-sm font-medium text-info-800">2</p>
              <p className="text-xs text-info-600">Recovering Regions</p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <p className="text-sm font-medium text-success-800">2</p>
              <p className="text-xs text-success-600">Stable Regions</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-800">63</p>
              <p className="text-xs text-secondary-600">Response Points</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Disaster trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Disaster Trends</h2>
                <div className="mt-2 sm:mt-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {}}
                    className="flex items-center"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization loading...</p>
                  <p className="text-gray-500 text-sm">Showing disaster trends over time</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {mockDisasterSummary.map(disaster => (
                  <div key={disaster.type} className="relative overflow-hidden">
                    <div className="p-4 rounded-lg border border-gray-200 bg-white">
                      <div className={`absolute top-0 left-0 h-1 w-full ${disaster.color}`}></div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">{disaster.type}</h3>
                      <div className="flex items-baseline">
                        <span className="text-xl font-semibold text-gray-900">{disaster.count}</span>
                        <span className="ml-2 text-xs font-medium flex items-center">
                          {disaster.trend > 0 ? (
                            <span className="text-emergency-600 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{disaster.trend}%
                            </span>
                          ) : disaster.trend < 0 ? (
                            <span className="text-success-600 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                              {disaster.trend}%
                            </span>
                          ) : (
                            <span className="text-gray-500">0%</span>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Active incidents</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card>
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Disaster Distribution</h2>
              
              <div className="bg-gray-100 rounded-lg p-6 mb-4 flex items-center justify-center h-48">
                <div className="text-center">
                  <ChartPie className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Disaster type distribution</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Floods</span>
                  </div>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Fires</span>
                  </div>
                  <span className="font-medium">27%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span>Storms</span>
                  </div>
                  <span className="font-medium">17%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span>Earthquakes</span>
                  </div>
                  <span className="font-medium">7%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span>Industrial</span>
                  </div>
                  <span className="font-medium">9%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Regional Status */}
      <Card className="mb-6">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Regional Status</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Crisis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Population
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affected
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Units
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRegionData.map((region) => (
                  <tr key={region.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{region.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(region.status)}`}>
                        {region.status.charAt(0).toUpperCase() + region.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.activeCrisis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.population.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              region.status === 'critical' ? 'bg-emergency-500' : 
                              region.status === 'warning' ? 'bg-warning-500' : 
                              region.status === 'recovering' ? 'bg-info-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${region.affectedPercent}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-900">{region.affectedPercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.responseUnits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRegion(region)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      
      {/* Selected Region Details */}
      {selectedRegion && (
        <Card className="mb-6">
          <div className="p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">{selectedRegion.name}</h2>
                  <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRegion.status)}`}>
                    {selectedRegion.status.charAt(0).toUpperCase() + selectedRegion.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-500 mt-1">{getStatusImpact(selectedRegion.status)}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <Button
                  variant="primary"
                  onClick={() => {}}
                >
                  Coordinate Response
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Population</h3>
                <p className="text-xl font-semibold text-gray-900">{selectedRegion.population.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Total residents</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Affected</h3>
                <p className="text-xl font-semibold text-gray-900">
                  {Math.round(selectedRegion.population * (selectedRegion.affectedPercent / 100)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">{selectedRegion.affectedPercent}% of population</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Response</h3>
                <p className="text-xl font-semibold text-gray-900">{selectedRegion.responseUnits}</p>
                <p className="text-sm text-gray-500 mt-1">Units deployed</p>
              </div>
            </div>
            
            {/* Active Incidents */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Incidents</h3>
            {selectedRegion.activeIncidents.length > 0 ? (
              <div className="space-y-4">
                {selectedRegion.activeIncidents.map((incident, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-emergency-500" />
                          <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Type: {incident.type}
                        </div>
                      </div>
                      <div>
                        {getSeverityBadge(incident.severity)}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Reported 3 hours ago
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {}}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900">No Active Incidents</h3>
                <p className="mt-2 text-sm text-gray-500">This region currently has no ongoing incidents.</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedRegion(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Resource allocation summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resource Allocation</h2>
            <div className="bg-gray-100 rounded-lg p-6 h-48 flex items-center justify-center mb-4">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Resource allocation by disaster type</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Floods</span>
                </div>
                <div className="text-sm font-medium">45% of resources</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Fires</span>
                </div>
                <div className="text-sm font-medium">30% of resources</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                  <span className="text-sm">Other incidents</span>
                </div>
                <div className="text-sm font-medium">25% of resources</div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Timeline</h2>
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute h-full w-px bg-gray-200 left-2.5 top-0"></div>
                
                <div className="relative flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">Initial Response Deployed</h4>
                      <span className="ml-2 text-xs text-gray-500">3 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      First responder teams deployed to Northern District for flood response
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute h-full w-px bg-gray-200 left-2.5 top-0"></div>
                
                <div className="relative flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">Emergency Shelters Activated</h4>
                      <span className="ml-2 text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      5 emergency shelters opened with capacity for 1,500 people
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute h-full w-px bg-gray-200 left-2.5 top-0"></div>
                
                <div className="relative flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">Additional Resources Requested</h4>
                      <span className="ml-2 text-xs text-gray-500">1 hour ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Request for additional 10 rescue teams and medical supplies
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 z-10">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">Evacuation In Progress</h4>
                    <span className="ml-2 text-xs text-gray-500">30 minutes ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Mandatory evacuation for Riverside District affecting approximately 5,000 residents
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="text-xs"
              >
                View Full Timeline
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
