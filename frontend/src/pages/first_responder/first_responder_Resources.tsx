import React, { useState } from 'react';
import { Search, Filter, Download, MapPin, ChevronRight, Truck, Package, Users, Shield, MapPinned, Stethoscope, Tent, Bike, Wind, Calendar, Clock, Utensils, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import StatCard from '../../components/ui/StatCard';
import Alert from '../../components/ui/Alert';

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance' | 'reserved';
  quantity: number;
  lastUpdated: string;
  assignedTo?: string;
}

const mockResources: Resource[] = [
  {
    id: 'RES-001',
    name: 'Emergency Response Vehicle',
    type: 'Vehicle',
    location: 'Station 3, North District',
    status: 'available',
    quantity: 4,
    lastUpdated: '2023-07-15T08:30:00Z'
  },
  {
    id: 'RES-002',
    name: 'Medical Supply Kit - Advanced',
    type: 'Medical',
    location: 'Central Hospital Storage',
    status: 'available',
    quantity: 15,
    lastUpdated: '2023-07-14T17:45:00Z'
  },
  {
    id: 'RES-003',
    name: 'Mobile Communication Unit',
    type: 'Communication',
    location: 'Command Center, HQ',
    status: 'in-use',
    quantity: 2,
    lastUpdated: '2023-07-15T09:10:00Z',
    assignedTo: 'Team Alpha - Riverside Operation'
  },
  {
    id: 'RES-004',
    name: 'Water Rescue Equipment',
    type: 'Rescue',
    location: 'Station 7, Riverside',
    status: 'in-use',
    quantity: 3,
    lastUpdated: '2023-07-15T07:20:00Z',
    assignedTo: 'Flood Response Team'
  },
  {
    id: 'RES-005',
    name: 'Emergency Power Generator',
    type: 'Power',
    location: 'Station 2, East District',
    status: 'maintenance',
    quantity: 1,
    lastUpdated: '2023-07-13T14:30:00Z'
  },
  {
    id: 'RES-006',
    name: 'Disaster Relief Tents',
    type: 'Shelter',
    location: 'Central Warehouse',
    status: 'available',
    quantity: 25,
    lastUpdated: '2023-07-12T11:15:00Z'
  },
  {
    id: 'RES-007',
    name: 'Food & Water Supply Kit',
    type: 'Supply',
    location: 'Central Warehouse',
    status: 'available',
    quantity: 50,
    lastUpdated: '2023-07-14T13:40:00Z'
  },
  {
    id: 'RES-008',
    name: 'Hazmat Protection Suits',
    type: 'Protection',
    location: 'Station 5, Industrial Zone',
    status: 'available',
    quantity: 10,
    lastUpdated: '2023-07-11T16:25:00Z'
  },
  {
    id: 'RES-009',
    name: 'Search and Rescue Drones',
    type: 'Equipment',
    location: 'Tech Center, HQ',
    status: 'reserved',
    quantity: 5,
    lastUpdated: '2023-07-15T10:05:00Z',
    assignedTo: 'Upcoming Search Operation'
  },
  {
    id: 'RES-010',
    name: 'Emergency Medical Transport Helicopter',
    type: 'Vehicle',
    location: 'Helipad, Medical Center',
    status: 'available',
    quantity: 1,
    lastUpdated: '2023-07-15T11:30:00Z'
  }
];

const Resources: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('categories');

  // Resource statistics
  const availableResources = mockResources.filter(resource => resource.status === 'available').length;
  const inUseResources = mockResources.filter(resource => resource.status === 'in-use').length;
  const totalResourceItems = mockResources.reduce((acc, resource) => acc + resource.quantity, 0);

  const filterResources = () => {
    return mockResources.filter(resource => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || resource.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredResources = filterResources();

  const resourceTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Communication', label: 'Communication' },
    { value: 'Rescue', label: 'Rescue' },
    { value: 'Power', label: 'Power' },
    { value: 'Shelter', label: 'Shelter' },
    { value: 'Supply', label: 'Supply' },
    { value: 'Protection', label: 'Protection' },
    { value: 'Equipment', label: 'Equipment' }
  ];

  const resourceStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'in-use', label: 'In Use' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'reserved', label: 'Reserved' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-success-600 bg-success-100';
      case 'in-use':
        return 'text-primary-600 bg-primary-100';
      case 'maintenance':
        return 'text-warning-600 bg-warning-100';
      case 'reserved':
        return 'text-secondary-600 bg-secondary-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Vehicle':
        return <Truck className="h-5 w-5 text-primary-500" />;
      case 'Medical':
        return <Stethoscope className="h-5 w-5 text-emergency-500" />;
      case 'Communication':
        return <Users className="h-5 w-5 text-secondary-500" />;
      case 'Rescue':
        return <Wind className="h-5 w-5 text-info-500" />;
      case 'Power':
        return <Shield className="h-5 w-5 text-warning-500" />;
      case 'Shelter':
        return <Tent className="h-5 w-5 text-success-500" />;
      case 'Supply':
        return <Package className="h-5 w-5 text-primary-500" />;
      case 'Protection':
        return <Shield className="h-5 w-5 text-emergency-500" />;
      case 'Equipment':
        return <Bike className="h-5 w-5 text-secondary-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };
    return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
        <p className="text-gray-600 mt-1">Track, request, and manage emergency resources</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link 
            to="/first_responder/incidents"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              location.pathname === '/first_responder/incidents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            View All Incidents
          </Link>
          <Link 
            to="/first_responder/resources"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              location.pathname === '/first_responder/resources'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Resources
          </Link>
          <Link 
            to="/first_responder/teams"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              location.pathname === '/first_responder/teams'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Team Management
          </Link>
        </nav>
      </div>

      {/* Alert for resource availability */}
      <Alert 
        type="info"
        title="Resource Update"
        message="More medical supplies are being delivered to Central Warehouse. Expected arrival in 2 hours."
        className="mb-6"
      />
      
      {/* Resource Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-emergency-100 flex items-center justify-center mr-3">
              <Stethoscope className="h-5 w-5 text-emergency-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Medical</h3>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                  <div className="bg-emergency-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-xs font-medium">75%</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center mr-3">
              <Utensils className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Food</h3>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                  <div className="bg-warning-600 h-2.5 rounded-full" style={{ width: '64%' }}></div>
                </div>
                <span className="text-xs font-medium">64%</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Transport</h3>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-xs font-medium">80%</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center mr-3">
              <Tent className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Shelter</h3>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                  <div className="bg-success-600 h-2.5 rounded-full" style={{ width: '21%' }}></div>
                </div>
                <span className="text-xs font-medium">21%</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === 'categories'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Categories
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === 'requests'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resource Requests
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Allocation History
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'categories' && (
            <div>
              {/* Resource statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard 
                  title="Available Resources"
                  value={availableResources}
                  icon={<Package className="h-6 w-6" />}
                  trend={2}
                  trendLabel="from yesterday"
                  trendType="up"
                  bgColor="bg-success-50"
                  iconColor="text-success-600"
                />
                <StatCard 
                  title="In-Use Resources"
                  value={inUseResources}
                  icon={<Truck className="h-6 w-6" />}
                  trend={5}
                  trendLabel="from yesterday"
                  trendType="up"
                  bgColor="bg-primary-50"
                  iconColor="text-primary-600"
                />
                <StatCard 
                  title="Total Items"
                  value={totalResourceItems}
                  icon={<Package className="h-6 w-6" />}
                  trend={0}
                  trendLabel="from yesterday"
                  trendType="same"
                  bgColor="bg-secondary-50"
                  iconColor="text-secondary-600"
                />
              </div>

              {/* Resource Categories */}
              <Card className="mb-6">
                <div className="p-4 md:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Resource Categories</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Medical Resources */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-emergency-100 flex items-center justify-center mb-3">
                        <Stethoscope className="h-6 w-6 text-emergency-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Medical</h3>
                      <p className="text-xs text-gray-500 mt-1">15 items</p>
                    </div>
                    
                    {/* Vehicles */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                        <Truck className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Vehicles</h3>
                      <p className="text-xs text-gray-500 mt-1">5 items</p>
                    </div>
                    
                    {/* Communication */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center mb-3">
                        <Users className="h-6 w-6 text-secondary-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Communication</h3>
                      <p className="text-xs text-gray-500 mt-1">2 items</p>
                    </div>
                    
                    {/* Shelter */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center mb-3">
                        <Tent className="h-6 w-6 text-success-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Shelter</h3>
                      <p className="text-xs text-gray-500 mt-1">25 items</p>
                    </div>
                    
                    {/* All Resources */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">All Resources</h3>
                      <p className="text-xs text-gray-500 mt-1">{mockResources.length} types</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Resource Inventory */}
              <Card className="mb-6">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold text-gray-900">Resource Inventory</h2>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="primary" 
                        onClick={() => {}}
                      >
                        Request Resources
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {}}
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search and filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search resources..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        options={resourceTypeOptions}
                        label="Resource Type"
                        hideLabel
                      />
                    </div>
                    <div>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={resourceStatusOptions}
                        label="Status"
                        hideLabel
                      />
                    </div>
                  </div>
                  
                  {/* Resource table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resource
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResources.length > 0 ? (
                          filteredResources.map((resource) => (
                            <tr key={resource.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    {getResourceIcon(resource.type)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                                    <div className="text-sm text-gray-500">ID: {resource.id} • {resource.type}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center text-sm text-gray-900">
                                  <MapPin className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                                  <span>{resource.location}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(resource.status)}`}>
                                  {resource.status === 'in-use' ? 'In Use' : 
                                  resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                                </span>
                                {resource.assignedTo && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Assigned to: {resource.assignedTo}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {resource.quantity} {resource.quantity === 1 ? 'unit' : 'units'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(resource.lastUpdated).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(resource.lastUpdated).toLocaleTimeString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {}}
                                  >
                                    Details
                                  </Button>
                                  <Button
                                    variant={resource.status === 'available' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => {}}
                                    disabled={resource.status !== 'available'}
                                  >
                                    {resource.status === 'available' ? 'Request' : 'Track'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                              No resources matching your filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredResources.length}</span> of{" "}
                          <span className="font-medium">{filteredResources.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button aria-current="page" className="relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                            1
                          </button>
                          <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Resource Optimization Insights Section */}
              <Card className="mb-6">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">AI Resource Optimization Insights</h2>
                      <p className="text-sm text-gray-600 mt-1">TetraNeurons AI analysis for optimal resource allocation</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => {}}
                      >
                        <BarChart2 className="mr-1 h-4 w-4" />
                        View Full Report
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Resource Allocation Recommendation</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Based on current disaster trends and resource usage patterns, we recommend:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Reallocate 5 medical kits from Central Storage to North District Station</li>
                            <li>Increase food supply stockpile by 20% in Central Warehouse</li>
                            <li>Pre-position 3 emergency vehicles closer to the flood-risk zones</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Usage Trend Analysis</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>Medical supplies usage has increased by 34% in the last 72 hours, primarily in the South and East districts. Additional stockpiling recommended.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-emerald-800">Predictive Resource Planning</h3>
                        <div className="mt-2 text-sm text-emerald-700">
                          <p>Based on weather forecasts and population movement data, we predict:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Increased shelter demand in Western district (70% probability)</li>
                            <li>Potential medical resource shortage in 48-72 hours</li>
                            <li>Vehicle access constraints in North District due to predicted rainfall</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Resource Map */}
              <Card>
                <div className="p-4 md:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Resource Locations</h2>
                  <div className="bg-gray-200 rounded-lg w-full h-96 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <MapPinned className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive resource map loading...</p>
                      <p className="text-gray-500 text-sm">View the real-time location of all emergency resources</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline">Open Full Map</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-4 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource Requests</h2>
              <p className="text-gray-600">This tab will show all resource requests from teams in the field.</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Allocation History</h2>
              <p className="text-gray-600">This tab will show the history of resource allocations and deployments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
