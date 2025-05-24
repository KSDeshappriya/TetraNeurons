import React, { useState } from 'react';
import { AlertTriangle, Calendar, Clock, Filter, MapPin, Search, Users, AlertCircle, CheckCircle2, XCircle, MoreVertical, ChevronDown, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import StatCard from '../../components/ui/StatCard';

interface Incident {
  id: string;
  title: string;
  location: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'pending';
  reportedAt: string;
  affectedCount: number;
  responderCount: number;
  description: string;
}

const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Major Flooding on Riverside',
    location: 'Riverside District, Central Zone',
    type: 'Flood',
    priority: 'high',
    status: 'active',
    reportedAt: '2023-07-15T09:30:00Z',
    affectedCount: 250,
    responderCount: 15,
    description: 'Severe flooding affecting residential areas. Multiple streets inaccessible. Evacuation in progress.'
  },
  {
    id: 'INC-002',
    title: 'Gas Leak in Commercial Building',
    location: 'Downtown Business District, Sector 5',
    type: 'Hazmat',
    priority: 'high',
    status: 'active',
    reportedAt: '2023-07-15T11:45:00Z',
    affectedCount: 75,
    responderCount: 8,
    description: 'Gas leak reported in multi-story office building. Evacuation complete. Hazmat team on site securing the area.'
  },
  {
    id: 'INC-003',
    title: 'Structure Fire in Apartment Complex',
    location: 'Westside Residential Area, Building 7',
    type: 'Fire',
    priority: 'high',
    status: 'active',
    reportedAt: '2023-07-15T10:15:00Z',
    affectedCount: 120,
    responderCount: 25,
    description: 'Three-alarm fire in apartment complex. Multiple units engaged. Evacuation in progress.'
  },
  {
    id: 'INC-004',
    title: 'Medical Emergency at Community Center',
    location: 'North Community Center, Oak Street',
    type: 'Medical',
    priority: 'medium',
    status: 'pending',
    reportedAt: '2023-07-15T13:20:00Z',
    affectedCount: 15,
    responderCount: 3,
    description: 'Multiple people reporting symptoms of food poisoning after community event. Medical teams dispatched.'
  },
  {
    id: 'INC-005',
    title: 'Traffic Accident with Multiple Casualties',
    location: 'Highway 101, Mile Marker 35',
    type: 'Traffic',
    priority: 'high',
    status: 'active',
    reportedAt: '2023-07-15T08:45:00Z',
    affectedCount: 8,
    responderCount: 12,
    description: 'Multi-vehicle collision with entrapment. Jaws of life deployed. Medical helicopters en route.'
  },
  {
    id: 'INC-006',
    title: 'Power Outage in Eastern District',
    location: 'Eastern District, Sectors 8-12',
    type: 'Infrastructure',
    priority: 'medium',
    status: 'resolved',
    reportedAt: '2023-07-14T19:10:00Z',
    affectedCount: 1500,
    responderCount: 6,
    description: 'Widespread power outage affecting eastern region. Utility companies working on repairs. Temporary shelters established.'
  }
];

const Incidents: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Active incidents count
  const activeIncidents = mockIncidents.filter(incident => incident.status === 'active').length;
  // Total affected people
  const totalAffected = mockIncidents.reduce((acc, incident) => acc + incident.affectedCount, 0);
  // Responders deployed
  const deployedResponders = mockIncidents.reduce((acc, incident) => acc + incident.responderCount, 0);

  const filterIncidents = () => {
    return mockIncidents.filter(incident => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || incident.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  };

  const filteredIncidents = filterIncidents();

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const incidentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Flood', label: 'Flood' },
    { value: 'Fire', label: 'Fire' },
    { value: 'Hazmat', label: 'Hazmat' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Traffic', label: 'Traffic' },
    { value: 'Infrastructure', label: 'Infrastructure' }
  ];

  const incidentStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const incidentPriorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="h-5 w-5 text-emergency-500" />;
      case 'resolved':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
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
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Incidents</h1>
        <p className="text-gray-600 mt-1">Manage and respond to ongoing incidents in your area</p>
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

      {/* Alert for critical incident */}
      <Alert 
        type="emergency"
        title="Critical Incident Alert"
        message="Major Flooding on Riverside requires immediate attention. 5 teams deployed, additional resources needed."
        className="mb-6"
      />

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Active Incidents"
          value={activeIncidents}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={10}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-emergency-50"
          iconColor="text-emergency-600"
        />
        <StatCard 
          title="People Affected"
          value={totalAffected}
          icon={<Users className="h-6 w-6" />}
          trend={25}
          trendLabel="from last week"
          trendType="up"
          bgColor="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard 
          title="Responders Deployed"
          value={deployedResponders}
          icon={<Users className="h-6 w-6" />}
          trend={5}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-secondary-50"
          iconColor="text-secondary-600"
        />
      </div>

      <Card className="mb-6">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">Incident Management</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="primary" 
                onClick={() => {}} 
                className="flex items-center"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report New Incident
              </Button>
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search incidents by title, location or description..."
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
                options={incidentTypeOptions}
                label="Type"
                hideLabel
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={incidentStatusOptions}
                label="Status"
                hideLabel
              />
            </div>
            <div>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={incidentPriorityOptions}
                label="Priority"
                hideLabel
              />
            </div>
          </div>
          
          {/* Incidents table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affected
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                            <div className="text-sm text-gray-500">ID: {incident.id}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(incident.reportedAt).toLocaleDateString()}
                              <Clock className="h-3 w-3 ml-2 mr-1" />
                              {new Date(incident.reportedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                          <span>{incident.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {incident.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityLabel(incident.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(incident.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{incident.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>{incident.affectedCount} people</span>
                          <span className="text-xs text-gray-500">{incident.responderCount} responders</span>
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
                            variant="secondary"
                            size="sm"
                            onClick={() => {}}
                          >
                            Assign
                          </Button>
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      No incidents matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredIncidents.length}</span> of{" "}
                  <span className="font-medium">{filteredIncidents.length}</span> results
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
      
      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => {}} 
            className="flex items-center justify-center py-6"
          >
            <Users className="mr-2 h-5 w-5" />
            View Available Teams
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {}} 
            className="flex items-center justify-center py-6"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Open Incident Map
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {}} 
            className="flex items-center justify-center py-6"
          >
            <ChevronDown className="mr-2 h-5 w-5" />
            Download Incident Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Incidents;
