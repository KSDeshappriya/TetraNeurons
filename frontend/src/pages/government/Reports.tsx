import React, { useState } from 'react';
import { Search, Filter, Download, BarChart3, Calendar, Map as MapIcon, FileText, AlertTriangle, ChevronDown, ChevronUp, Clock, MapPin, User, Check, X, ArrowUpDown, Printer, Mail, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import StatCard from '../../components/ui/StatCard';
import Alert from '../../components/ui/Alert';

interface Report {
  id: string;
  title: string;
  type: 'incident' | 'situation' | 'resource' | 'damage' | 'progress';
  status: 'submitted' | 'verified' | 'flagged' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  submittedBy: {
    name: string;
    role: string;
    avatar: string;
  };
  location: string;
  category: string;
  description: string;
  submittedAt: string;
  lastUpdate: string;
  affectedCount?: number;
  verifiedBy?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
  }>;
  comments?: number;
}

const mockReports: Report[] = [
  {
    id: 'RPT-001',
    title: 'Flooding of Main Street Area',
    type: 'incident',
    status: 'verified',
    priority: 'high',
    submittedBy: {
      name: 'Michael Torres',
      role: 'First Responder',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Torres&background=0D8ABC&color=fff'
    },
    location: 'Main Street & River Road',
    category: 'Flood',
    description: 'Severe flooding in the Main Street area affecting approximately 20 buildings. Water levels rising rapidly. Emergency evacuation in progress.',
    submittedAt: '2023-07-15T08:30:00Z',
    lastUpdate: '2023-07-15T09:15:00Z',
    affectedCount: 150,
    verifiedBy: 'Sarah Johnson',
    attachments: [
      {
        id: 'ATT-001',
        name: 'flood_photo_1.jpg',
        type: 'image/jpeg',
        size: '2.4 MB'
      },
      {
        id: 'ATT-002',
        name: 'situation_assessment.pdf',
        type: 'application/pdf',
        size: '1.2 MB'
      }
    ],
    comments: 8
  },
  {
    id: 'RPT-002',
    title: 'Structural Damage at Lincoln High School',
    type: 'damage',
    status: 'verified',
    priority: 'high',
    submittedBy: {
      name: 'Jennifer Patel',
      role: 'Civil Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Jennifer+Patel&background=7C3AED&color=fff'
    },
    location: '450 School Avenue',
    category: 'Infrastructure',
    description: 'Structural assessment of Lincoln High School shows significant damage to east wing of building. Potential roof collapse risk. Building evacuated and marked unsafe.',
    submittedAt: '2023-07-14T14:20:00Z',
    lastUpdate: '2023-07-14T16:45:00Z',
    attachments: [
      {
        id: 'ATT-003',
        name: 'structural_assessment.pdf',
        type: 'application/pdf',
        size: '3.5 MB'
      }
    ],
    comments: 5
  },
  {
    id: 'RPT-003',
    title: 'Medical Supply Shortage at Central Hospital',
    type: 'resource',
    status: 'resolved',
    priority: 'high',
    submittedBy: {
      name: 'Dr. Amanda Wu',
      role: 'Medical Director',
      avatar: 'https://ui-avatars.com/api/?name=Amanda+Wu&background=BE185D&color=fff'
    },
    location: 'Central Hospital, 1000 Medical Drive',
    category: 'Medical',
    description: 'Critical shortage of IV fluids, antibiotics, and wound care supplies. ER at capacity with disaster victims. Immediate resupply needed.',
    submittedAt: '2023-07-14T10:10:00Z',
    lastUpdate: '2023-07-14T13:20:00Z',
    attachments: [
      {
        id: 'ATT-004',
        name: 'supply_inventory.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: '245 KB'
      }
    ],
    comments: 12
  },
  {
    id: 'RPT-004',
    title: 'Gas Leak in Downtown Area',
    type: 'incident',
    status: 'submitted',
    priority: 'high',
    submittedBy: {
      name: 'Robert Chen',
      role: 'Citizen',
      avatar: 'https://ui-avatars.com/api/?name=Robert+Chen&background=0E7490&color=fff'
    },
    location: '300 Block, Washington Street',
    category: 'Hazmat',
    description: 'Strong smell of gas reported in downtown area. Multiple calls from citizens. Possible gas main leak.',
    submittedAt: '2023-07-15T10:55:00Z',
    lastUpdate: '2023-07-15T10:55:00Z',
    comments: 2
  },
  {
    id: 'RPT-005',
    title: 'Shelter Capacity and Distribution Update',
    type: 'situation',
    status: 'verified',
    priority: 'medium',
    submittedBy: {
      name: 'Carlos Mendez',
      role: 'Shelter Coordinator',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendez&background=065F46&color=fff'
    },
    location: 'Multiple locations',
    category: 'Shelter',
    description: 'Current shelter capacity at 85%. North High School shelter at full capacity. Community Center and Library shelters have remaining capacity. Additional supplies needed at North High.',
    submittedAt: '2023-07-14T18:30:00Z',
    lastUpdate: '2023-07-15T08:10:00Z',
    affectedCount: 850,
    verifiedBy: 'David Lee',
    attachments: [
      {
        id: 'ATT-005',
        name: 'shelter_status.pdf',
        type: 'application/pdf',
        size: '850 KB'
      }
    ],
    comments: 7
  },
  {
    id: 'RPT-006',
    title: 'Road Closures on Highway 101',
    type: 'situation',
    status: 'verified',
    priority: 'medium',
    submittedBy: {
      name: 'Officer Martinez',
      role: 'Police Department',
      avatar: 'https://ui-avatars.com/api/?name=Officer+Martinez&background=1E40AF&color=fff'
    },
    location: 'Highway 101, Mile Markers 35-42',
    category: 'Transportation',
    description: 'Highway 101 closed between exits 35 and 42 due to flooding. Traffic being diverted to Route 15. Expected to remain closed for 48-72 hours.',
    submittedAt: '2023-07-14T12:15:00Z',
    lastUpdate: '2023-07-15T09:20:00Z',
    verifiedBy: 'Traffic Control Center',
    attachments: [
      {
        id: 'ATT-006',
        name: 'road_closure_map.jpg',
        type: 'image/jpeg',
        size: '1.8 MB'
      }
    ],
    comments: 10
  },
  {
    id: 'RPT-007',
    title: 'Power Outage in Eastern District',
    type: 'incident',
    status: 'flagged',
    priority: 'high',
    submittedBy: {
      name: 'Lisa Jackson',
      role: 'Utility Company',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Jackson&background=B45309&color=fff'
    },
    location: 'Eastern District, Sectors 5-8',
    category: 'Infrastructure',
    description: 'Widespread power outage affecting approximately 15,000 residents. Caused by transformer damage at substation. Estimated repair time: 24-36 hours.',
    submittedAt: '2023-07-14T20:05:00Z',
    lastUpdate: '2023-07-15T06:30:00Z',
    affectedCount: 15000,
    comments: 15
  },
  {
    id: 'RPT-008',
    title: 'Recovery Progress at Westside',
    type: 'progress',
    status: 'submitted',
    priority: 'low',
    submittedBy: {
      name: 'Kevin Williams',
      role: 'Recovery Coordinator',
      avatar: 'https://ui-avatars.com/api/?name=Kevin+Williams&background=4338CA&color=fff'
    },
    location: 'Westside District',
    category: 'Recovery',
    description: 'Recovery efforts in Westside district at 60% completion. Water services restored to 90% of area. Power at 75%. Road clearance complete. Debris removal ongoing.',
    submittedAt: '2023-07-15T09:45:00Z',
    lastUpdate: '2023-07-15T09:45:00Z',
    attachments: [
      {
        id: 'ATT-007',
        name: 'recovery_metrics.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: '450 KB'
      }
    ],
    comments: 3
  }
];

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Statistics
  const totalReports = mockReports.length;
  const verifiedReports = mockReports.filter(report => report.status === 'verified').length;
  const highPriorityReports = mockReports.filter(report => report.priority === 'high').length;
  const totalAffected = mockReports.reduce((sum, report) => sum + (report.affectedCount || 0), 0);

  const filterReports = () => {
    return mockReports.filter(report => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    }).sort((a, b) => {
      // For date fields
      if (['submittedAt', 'lastUpdate'].includes(sortField)) {
        const aDate = new Date(a[sortField as keyof Report] as string).getTime();
        const bDate = new Date(b[sortField as keyof Report] as string).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      } 
      // For string fields
      else {
        const aValue = a[sortField as keyof Report] as string;
        const bValue = b[sortField as keyof Report] as string;
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
    });
  };

  const filteredReports = filterReports();

  const reportTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'incident', label: 'Incident' },
    { value: 'situation', label: 'Situation' },
    { value: 'resource', label: 'Resource' },
    { value: 'damage', label: 'Damage' },
    { value: 'progress', label: 'Progress' }
  ];
  
  const reportStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'verified', label: 'Verified' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'resolved', label: 'Resolved' }
  ];
  
  const reportPriorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'text-info-600 bg-info-100';
      case 'verified':
        return 'text-success-600 bg-success-100';
      case 'flagged':
        return 'text-warning-600 bg-warning-100';
      case 'resolved':
        return 'text-primary-600 bg-primary-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-emergency-600 bg-emergency-100';
      case 'medium':
        return 'text-warning-600 bg-warning-100';
      case 'low':
        return 'text-success-600 bg-success-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="h-5 w-5 text-emergency-500" />;
      case 'situation':
        return <MapIcon className="h-5 w-5 text-info-500" />;
      case 'resource':
        return <BarChart3 className="h-5 w-5 text-primary-500" />;
      case 'damage':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'progress':
        return <Check className="h-5 w-5 text-success-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disaster Reports</h1>
        <p className="text-gray-600 mt-1">Review and analyze incident reports and situation updates</p>
      </div>

      {/* Alert for high priority report */}
      <Alert 
        type="emergency"
        title="Critical Report Received"
        message="New high priority report: Gas Leak in Downtown Area requires immediate verification."
        className="mb-6"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Reports"
          value={totalReports}
          icon={<FileText className="h-6 w-6" />}
          trend={5}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-secondary-50"
          iconColor="text-secondary-600"
        />
        <StatCard 
          title="Verified Reports"
          value={verifiedReports}
          icon={<Check className="h-6 w-6" />}
          trend={3}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard 
          title="High Priority"
          value={highPriorityReports}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={2}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-emergency-50"
          iconColor="text-emergency-600"
        />
        <StatCard 
          title="People Affected"
          value={totalAffected.toLocaleString()}
          icon={<User className="h-6 w-6" />}
          trend={1200}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-primary-50"
          iconColor="text-primary-600"
        />
      </div>

      {/* Reports Table */}
      <Card className="mb-6">
        <div className="p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Incident Reports</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilterPanel ? "Hide Filters" : "Show Filters"}
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
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search reports by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {showFilterPanel && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={reportTypeOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={reportStatusOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  options={reportPriorityOptions}
                />
              </div>
            </div>
          )}
          
          {/* Reports table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center space-x-1" onClick={() => toggleSort('title')}>
                      <span>Report Details</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center space-x-1" onClick={() => toggleSort('priority')}>
                      <span>Priority</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center space-x-1" onClick={() => toggleSort('status')}>
                      <span>Status</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center space-x-1" onClick={() => toggleSort('submittedAt')}>
                      <span>Submitted</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center space-x-1" onClick={() => toggleSort('submittedBy')}>
                      <span>Submitted By</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {getReportTypeIcon(report.type)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              {report.location}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                              {report.id} • {report.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                          {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(report.submittedAt)}</div>
                        <div className="text-xs text-gray-500">{getTimeDifference(report.submittedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <img 
                              src={report.submittedBy.avatar}
                              alt={report.submittedBy.name} 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{report.submittedBy.name}</div>
                            <div className="text-xs text-gray-500">{report.submittedBy.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      No reports matching your filters
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
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReports.length}</span> of{" "}
                  <span className="font-medium">{filteredReports.length}</span> results
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
      
      {/* Report visualization summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Category</h3>
            <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Category distribution chart</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                  <span>Flood</span>
                </div>
                <span className="font-medium">35%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emergency-500 mr-2"></div>
                  <span>Infrastructure</span>
                </div>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                  <span>Hazmat</span>
                </div>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                  <span>Other</span>
                </div>
                <span className="font-medium">25%</span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Location</h3>
            <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Geographic distribution map</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emergency-500 mr-2"></div>
                  <span>Northern District</span>
                </div>
                <span className="font-medium">12 reports</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                  <span>Central Business District</span>
                </div>
                <span className="font-medium">8 reports</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-info-500 mr-2"></div>
                  <span>Eastern Suburbs</span>
                </div>
                <span className="font-medium">5 reports</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                  <span>Other Areas</span>
                </div>
                <span className="font-medium">9 reports</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedReport(null)}></div>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full relative z-10 mx-4 overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="mt-1">
                    {getReportTypeIcon(selectedReport.type)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedReport.title}</h3>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                      <span className="flex items-center mr-4">
                        <FileText className="h-4 w-4 mr-1" />
                        {selectedReport.id}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedReport.location}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                    {selectedReport.priority.charAt(0).toUpperCase() + selectedReport.priority.slice(1)} Priority
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {selectedReport.category}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                    {selectedReport.type} Report
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-800">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Report Details</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-xs text-gray-500">Submitted on:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedReport.submittedAt)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-xs text-gray-500">Last updated:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedReport.lastUpdate)}</dd>
                      </div>
                      {selectedReport.affectedCount !== undefined && (
                        <div className="flex justify-between">
                          <dt className="text-xs text-gray-500">People affected:</dt>
                          <dd className="text-sm text-gray-900">{selectedReport.affectedCount.toLocaleString()}</dd>
                        </div>
                      )}
                      {selectedReport.verifiedBy && (
                        <div className="flex justify-between">
                          <dt className="text-xs text-gray-500">Verified by:</dt>
                          <dd className="text-sm text-gray-900">{selectedReport.verifiedBy}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted By</h4>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        <img 
                          src={selectedReport.submittedBy.avatar}
                          alt={selectedReport.submittedBy.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{selectedReport.submittedBy.name}</div>
                        <div className="text-xs text-gray-500">{selectedReport.submittedBy.role}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedReport.attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {attachment.type.startsWith('image') ? (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                              <Image className="h-6 w-6 text-gray-500" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{attachment.name}</div>
                            <div className="text-xs text-gray-500">{attachment.size}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {}}
                            className="ml-4"
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.comments !== undefined && selectedReport.comments > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      className="inline-flex items-center"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View {selectedReport.comments} Comments
                    </Button>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      className="flex items-center"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      className="flex items-center"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  <div>
                    {selectedReport.status === 'submitted' && (
                      <Button
                        variant="primary"
                        onClick={() => {}}
                      >
                        Verify Report
                      </Button>
                    )}
                    {selectedReport.status === 'flagged' && (
                      <Button
                        variant="primary"
                        onClick={() => {}}
                      >
                        Review Report
                      </Button>
                    )}
                    {selectedReport.status === 'verified' && selectedReport.type === 'incident' && (
                      <Button
                        variant="primary"
                        onClick={() => {}}
                      >
                        Respond to Incident
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
