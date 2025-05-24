import React, { useState } from 'react';
import { Search, Filter, Download, MapPin, ChevronRight, Truck, Package, Users, Shield, MapPinned, Building, Clipboard, ArrowUpDown, PlusCircle, Layers, Activity, AlertOctagon, Briefcase } from 'lucide-react';
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
  category: 'medical' | 'transportation' | 'shelter' | 'food' | 'equipment' | 'personnel';
  availableQuantity: number;
  allocatedQuantity: number;
  totalQuantity: number;
  lastUpdated: string;
  location: string;
  status: 'available' | 'limited' | 'critical' | 'restocking';
}

interface RegionAllocation {
  region: string;
  medical: number;
  transportation: number;
  shelter: number;
  food: number;
  equipment: number;
  personnel: number;
}

const mockResources: Resource[] = [
  {
    id: 'MED-001',
    name: 'Emergency Medical Kits',
    type: 'Supplies',
    category: 'medical',
    availableQuantity: 532,
    allocatedQuantity: 168,
    totalQuantity: 700,
    lastUpdated: '2023-07-15T10:30:00Z',
    location: 'Central Medical Storage',
    status: 'available'
  },
  {
    id: 'TRANS-001',
    name: 'Evacuation Vehicles',
    type: 'Vehicle',
    category: 'transportation',
    availableQuantity: 18,
    allocatedQuantity: 32,
    totalQuantity: 50,
    lastUpdated: '2023-07-15T11:15:00Z',
    location: 'Northern Vehicle Depot',
    status: 'limited'
  },
  {
    id: 'SHEL-001',
    name: 'Emergency Shelter Kits',
    type: 'Shelter',
    category: 'shelter',
    availableQuantity: 215,
    allocatedQuantity: 85,
    totalQuantity: 300,
    lastUpdated: '2023-07-14T16:45:00Z',
    location: 'Southern Distribution Center',
    status: 'available'
  },
  {
    id: 'FOOD-001',
    name: 'Food Relief Packages',
    type: 'Food',
    category: 'food',
    availableQuantity: 1850,
    allocatedQuantity: 3150,
    totalQuantity: 5000,
    lastUpdated: '2023-07-15T08:20:00Z',
    location: 'Central Food Bank',
    status: 'limited'
  },
  {
    id: 'EQUIP-001',
    name: 'Water Pumps',
    type: 'Equipment',
    category: 'equipment',
    availableQuantity: 8,
    allocatedQuantity: 42,
    totalQuantity: 50,
    lastUpdated: '2023-07-15T09:10:00Z',
    location: 'Western Equipment Storage',
    status: 'critical'
  },
  {
    id: 'PER-001',
    name: 'Emergency Response Team',
    type: 'Personnel',
    category: 'personnel',
    availableQuantity: 25,
    allocatedQuantity: 75,
    totalQuantity: 100,
    lastUpdated: '2023-07-15T07:35:00Z',
    location: 'Main Command Center',
    status: 'critical'
  },
  {
    id: 'MED-002',
    name: 'Field Hospital Units',
    type: 'Facility',
    category: 'medical',
    availableQuantity: 3,
    allocatedQuantity: 2,
    totalQuantity: 5,
    lastUpdated: '2023-07-14T12:15:00Z',
    location: 'Medical Logistics Center',
    status: 'available'
  },
  {
    id: 'TRANS-002',
    name: 'Rescue Helicopters',
    type: 'Vehicle',
    category: 'transportation',
    availableQuantity: 1,
    allocatedQuantity: 4,
    totalQuantity: 5,
    lastUpdated: '2023-07-15T13:25:00Z',
    location: 'Central Helipad',
    status: 'critical'
  },
  {
    id: 'EQUIP-002',
    name: 'Power Generators',
    type: 'Equipment',
    category: 'equipment',
    availableQuantity: 15,
    allocatedQuantity: 10,
    totalQuantity: 25,
    lastUpdated: '2023-07-13T15:40:00Z',
    location: 'Eastern Equipment Depot',
    status: 'restocking'
  },
  {
    id: 'FOOD-002',
    name: 'Drinking Water (Liters)',
    type: 'Water',
    category: 'food',
    availableQuantity: 25000,
    allocatedQuantity: 75000,
    totalQuantity: 100000,
    lastUpdated: '2023-07-15T10:10:00Z',
    location: 'Water Treatment Facility',
    status: 'limited'
  }
];

const mockRegionAllocations: RegionAllocation[] = [
  {
    region: 'Northern District',
    medical: 120,
    transportation: 22,
    shelter: 45,
    food: 1800,
    equipment: 28,
    personnel: 45
  },
  {
    region: 'Central Business District',
    medical: 35,
    transportation: 8,
    shelter: 25,
    food: 950,
    equipment: 15,
    personnel: 22
  },
  {
    region: 'Eastern Suburbs',
    medical: 8,
    transportation: 3,
    shelter: 10,
    food: 250,
    equipment: 6,
    personnel: 5
  },
  {
    region: 'Southern Coastal Region',
    medical: 5,
    transportation: 2,
    shelter: 5,
    food: 150,
    equipment: 3,
    personnel: 3
  }
];

const Resources: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [allocationView, setAllocationView] = useState(false);

  // Calculate resource statistics
  const totalResources = mockResources.reduce((acc, resource) => acc + resource.totalQuantity, 0);
  const availableResources = mockResources.reduce((acc, resource) => acc + resource.availableQuantity, 0);
  const criticalResources = mockResources.filter(resource => resource.status === 'critical').length;
  
  const filterResources = () => {
    return mockResources.filter(resource => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const filteredResources = filterResources();

  const resourceCategoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'medical', label: 'Medical' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'shelter', label: 'Shelter' },
    { value: 'food', label: 'Food & Water' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'personnel', label: 'Personnel' }
  ];

  const resourceStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited' },
    { value: 'critical', label: 'Critical' },
    { value: 'restocking', label: 'Restocking' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-success-600 bg-success-100';
      case 'limited':
        return 'text-warning-600 bg-warning-100';
      case 'critical':
        return 'text-emergency-600 bg-emergency-100';
      case 'restocking':
        return 'text-info-600 bg-info-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return <Briefcase className="h-5 w-5 text-emergency-500" />;
      case 'transportation':
        return <Truck className="h-5 w-5 text-primary-500" />;
      case 'shelter':
        return <Building className="h-5 w-5 text-info-500" />;
      case 'food':
        return <Package className="h-5 w-5 text-success-500" />;
      case 'equipment':
        return <Layers className="h-5 w-5 text-warning-500" />;
      case 'personnel':
        return <Users className="h-5 w-5 text-secondary-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <Link
              to="/government/overview"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/government/overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/government/reports"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/government/reports'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </Link>
            <Link
              to="/government/resources"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/government/resources'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resources
            </Link>
          </nav>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-1">Coordinate and allocate disaster response resources</p>
        </div>

        {/* Alert for critical resource */}
        <Alert 
          type="warning"
          title="Critical Resource Alert"
          message="Emergency Response Teams are at 75% allocation. Water Pumps and Rescue Helicopters are critically low."
          className="mb-6"
        />

        {/* Resource statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Resources"
            value={totalResources.toLocaleString()}
            icon={<Package className="h-6 w-6" />}
            trend={5}
            trendLabel="from last week"
            trendType="up"
            bgColor="bg-secondary-50"
            iconColor="text-secondary-600"
          />
          <StatCard 
            title="Available Resources"
            value={availableResources.toLocaleString()}
            icon={<Clipboard className="h-6 w-6" />}
            trend={-8}
            trendLabel="from last week"
            trendType="down"
            bgColor="bg-success-50"
            iconColor="text-success-600"
          />
          <StatCard 
            title="Allocation Rate"
            value={`${Math.round(((totalResources - availableResources) / totalResources) * 100)}%`}
            icon={<Activity className="h-6 w-6" />}
            trend={12}
            trendLabel="from last week"
            trendType="up"
            bgColor="bg-primary-50"
            iconColor="text-primary-600"
          />
          <StatCard 
            title="Critical Resources"
            value={criticalResources}
            icon={<AlertOctagon className="h-6 w-6" />}
            trend={2}
            trendLabel="from last week"
            trendType="up"
            bgColor="bg-emergency-50"
            iconColor="text-emergency-600"
          />
        </div>

        {/* View toggle */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`
                px-4 py-2 text-sm font-medium rounded-l-md border-y border-l
                ${!allocationView ? 
                  'bg-primary-600 text-white border-primary-600' : 
                  'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              `}
              onClick={() => setAllocationView(false)}
            >
              Resource Inventory
            </button>
            <button
              type="button"
              className={`
                px-4 py-2 text-sm font-medium rounded-r-md border
                ${allocationView ? 
                  'bg-primary-600 text-white border-primary-600' : 
                  'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              `}
              onClick={() => setAllocationView(true)}
            >
              Regional Allocation
            </button>
          </div>
        </div>

        {!allocationView ? (
          <>
            {/* Resource Categories */}
            <Card className="mb-6">
              <div className="p-4 md:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resource Categories</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Medical */}
                  <div 
                    className={`
                      bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer
                      flex flex-col items-center justify-center text-center
                      ${categoryFilter === 'medical' ? 'border-emergency-500 bg-emergency-50' : 'border-gray-200'}
                    `}
                    onClick={() => setCategoryFilter(categoryFilter === 'medical' ? 'all' : 'medical')}
                  >
                    <div className="h-12 w-12 rounded-full bg-emergency-100 flex items-center justify-center mb-3">
                      <Briefcase className="h-6 w-6 text-emergency-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Medical</h3>
                    <p className="text-xs text-gray-500 mt-1">2 resource types</p>
                  </div>
                  
                  {/* Transportation */}
                  <div 
                    className={`
                      bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer
                      flex flex-col items-center justify-center text-center
                      ${categoryFilter === 'transportation' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                    `}
                    onClick={() => setCategoryFilter(categoryFilter === 'transportation' ? 'all' : 'transportation')}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                      <Truck className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Transportation</h3>
                    <p className="text-xs text-gray-500 mt-1">2 resource types</p>
                  </div>
                  
                  {/* Shelter */}
                  <div 
                    className={`
                      bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer
                      flex flex-col items-center justify-center text-center
                      ${categoryFilter === 'shelter' ? 'border-info-500 bg-info-50' : 'border-gray-200'}
                    `}
                    onClick={() => setCategoryFilter(categoryFilter === 'shelter' ? 'all' : 'shelter')}
                  >
                    <div className="h-12 w-12 rounded-full bg-info-100 flex items-center justify-center mb-3">
                      <Building className="h-6 w-6 text-info-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Shelter</h3>
                    <p className="text-xs text-gray-500 mt-1">1 resource type</p>
                  </div>
                  
                  {/* Food & Water */}
                  <div 
                    className={`
                      bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer
                      flex flex-col items-center justify-center text-center
                      ${categoryFilter === 'food' ? 'border-success-500 bg-success-50' : 'border-gray-200'}
                    `}
                    onClick={() => setCategoryFilter(categoryFilter === 'food' ? 'all' : 'food')}
                  >
                    <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center mb-3">
                      <Package className="h-6 w-6 text-success-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Food & Water</h3>
                    <p className="text-xs text-gray-500 mt-1">2 resource types</p>
                  </div>
                  
                  {/* Equipment */}
                  <div 
                    className={`
                      bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer
                      flex flex-col items-center justify-center text-center
                      ${categoryFilter === 'equipment' ? 'border-warning-500 bg-warning-50' : 'border-gray-200'}
                    `}
                    onClick={() => setCategoryFilter(categoryFilter === 'equipment' ? 'all' : 'equipment')}
                  >
                    <div className="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center mb-3">
                      <Layers className="h-6 w-6 text-warning-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Equipment</h3>
                    <p className="text-xs text-gray-500 mt-1">2 resource types</p>
                  </div>
                  
                  {/* Personnel */}
                  <div 
                    className={`
                      bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer
                      flex flex-col items-center justify-center text-center
                      ${categoryFilter === 'personnel' ? 'border-secondary-500 bg-secondary-50' : 'border-gray-200'}
                    `}
                    onClick={() => setCategoryFilter(categoryFilter === 'personnel' ? 'all' : 'personnel')}
                  >
                    <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-secondary-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Personnel</h3>
                    <p className="text-xs text-gray-500 mt-1">1 resource type</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Resource Inventory */}
            <Card className="mb-6">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 md:mb-0">Resource Inventory</h2>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="primary" 
                      onClick={() => {}}
                      className="flex items-center"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Resources
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {}}
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
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
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      options={resourceCategoryOptions}
                      label="Category"
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
                          Available
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Allocated
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
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
                                  {getCategoryIcon(resource.category)}
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
                                {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {resource.availableQuantity.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {resource.allocatedQuantity.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {resource.totalQuantity.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedResource(resource)}
                                >
                                  Details
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {}}
                                  disabled={resource.availableQuantity === 0}
                                >
                                  Allocate
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
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
            
            {/* Resource Details Modal */}
            {selectedResource && (
              <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedResource(null)}></div>
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full relative z-10 mx-4">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          {getCategoryIcon(selectedResource.category)}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">{selectedResource.name}</h3>
                          <p className="text-sm text-gray-500">ID: {selectedResource.id} • {selectedResource.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedResource(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedResource.status)}`}>
                            {selectedResource.status.charAt(0).toUpperCase() + selectedResource.status.slice(1)}
                          </span>
                          <p className="ml-2 text-sm text-gray-600">
                            {selectedResource.status === 'available' ? 'Sufficient quantities available for allocation' : 
                             selectedResource.status === 'limited' ? 'Limited quantities remaining, allocate with caution' :
                             selectedResource.status === 'critical' ? 'Critically low quantities, urgent resupply needed' :
                             'Currently being restocked, new supplies expected soon'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Inventory Details</h4>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <dt className="text-xs text-gray-500">Available</dt>
                            <dd className="text-lg font-medium text-gray-900">{selectedResource.availableQuantity.toLocaleString()}</dd>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <dt className="text-xs text-gray-500">Allocated</dt>
                            <dd className="text-lg font-medium text-gray-900">{selectedResource.allocatedQuantity.toLocaleString()}</dd>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <dt className="text-xs text-gray-500">Total</dt>
                            <dd className="text-lg font-medium text-gray-900">{selectedResource.totalQuantity.toLocaleString()}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Location Information</h4>
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-900">{selectedResource.location}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Regional Allocation</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Northern District</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Central Business District</span>
                            <span className="font-medium">30%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Other Regions</span>
                            <span className="font-medium">25%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedResource.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedResource(null)}
                      >
                        Close
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {}}
                        disabled={selectedResource.availableQuantity === 0}
                      >
                        Allocate Resources
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Regional Allocation View */}
            <Card className="mb-6">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Regional Resource Allocation</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => {}}
                    className="flex items-center mt-2 md:mt-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Allocation Report
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Region
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1 text-emergency-500" />
                            Medical
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-1 text-primary-500" />
                            Transportation
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1 text-info-500" />
                            Shelter
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-success-500" />
                            Food & Water
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Layers className="h-4 w-4 mr-1 text-warning-500" />
                            Equipment
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-secondary-500" />
                            Personnel
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockRegionAllocations.map((allocation, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                              <div className="text-sm font-medium text-gray-900">{allocation.region}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {allocation.medical.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {allocation.transportation.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {allocation.shelter.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {allocation.food.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {allocation.equipment.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {allocation.personnel.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {}}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
            
            {/* Allocation Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Distribution by Region</h3>
                  <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Resource distribution visualization</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Northern District has received the highest allocation of resources (45%), followed by Central Business District (30%).</p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Request Fulfillment</h3>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Northern District</span>
                      <span className="text-sm text-gray-700">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Central Business District</span>
                      <span className="text-sm text-gray-700">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Eastern Suburbs</span>
                      <span className="text-sm text-gray-700">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-success-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Southern Coastal Region</span>
                      <span className="text-sm text-gray-700">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-success-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Resources;
