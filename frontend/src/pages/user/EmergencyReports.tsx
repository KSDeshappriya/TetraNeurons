import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  ExternalLink,
  CheckCircle2,
  Clock3,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface EmergencyReport {
  id: string;
  type: string;
  description: string;
  location: string;
  urgency: 'Critical' | 'High Priority' | 'Medium Priority' | 'Low Priority';
  status: 'Active' | 'Responding' | 'Resolved' | 'Archived';
  reportedAt: string;
  peopleAffected: number;
  hasMedia: boolean;
}

const EmergencyReports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  
  // Mock data for emergency reports
  const reports: EmergencyReport[] = [
    {
      id: 'ER-2023-001',
      type: 'Flood',
      description: 'Rising water levels in downtown area, streets becoming impassable.',
      location: 'Downtown River District',
      urgency: 'Critical',
      status: 'Active',
      reportedAt: '2023-06-15T09:30:00',
      peopleAffected: 120,
      hasMedia: true
    },
    {
      id: 'ER-2023-002',
      type: 'Building Collapse',
      description: 'Partial collapse of commercial building after earthquake.',
      location: 'Westside Commercial Zone',
      urgency: 'High Priority',
      status: 'Responding',
      reportedAt: '2023-06-14T15:45:00',
      peopleAffected: 15,
      hasMedia: true
    },
    {
      id: 'ER-2023-003',
      type: 'Fire',
      description: 'Residential fire spreading to adjacent buildings.',
      location: 'North Residential Area',
      urgency: 'High Priority',
      status: 'Resolved',
      reportedAt: '2023-06-10T18:20:00',
      peopleAffected: 30,
      hasMedia: false
    },
    {
      id: 'ER-2023-004',
      type: 'Storm',
      description: 'Strong winds and heavy rain causing power outages.',
      location: 'Eastern District',
      urgency: 'Medium Priority',
      status: 'Archived',
      reportedAt: '2023-05-28T21:15:00',
      peopleAffected: 2000,
      hasMedia: false
    }
  ];

  // Formatting functions
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const getTimeSince = (dateString: string): string => {
    const reportDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - reportDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  const getUrgencyClass = (urgency: string): string => {
    switch (urgency) {
      case 'Critical':
        return 'bg-emergency-100 text-emergency-800 border-emergency-200';
      case 'High Priority':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'Medium Priority':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'Low Priority':
        return 'bg-success-100 text-success-800 border-success-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <AlertTriangle className="h-5 w-5 text-emergency-500" />;
      case 'Responding':
        return <Clock3 className="h-5 w-5 text-primary-500" />;
      case 'Resolved':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'Archived':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };
  
  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesUrgency = urgencyFilter === 'all' || report.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesUrgency;
  });

  // Get unique values for filter dropdowns
  const uniqueTypes = Array.from(new Set(reports.map(report => report.type)));
  const uniqueStatuses = Array.from(new Set(reports.map(report => report.status)));
  const uniqueUrgencies = Array.from(new Set(reports.map(report => report.urgency)));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Reports</h1>
          <p className="text-gray-600 mt-1">View and track reports submitted by you and other users in your area</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                label=""
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
            <div className="md:col-span-3 flex flex-wrap gap-3">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...uniqueStatuses.map(status => ({ value: status, label: status }))
                ]}
                className="w-40"
              />
              
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  ...uniqueTypes.map(type => ({ value: type, label: type }))
                ]}
                className="w-40"
              />
              
              <Select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Urgency Levels' },
                  ...uniqueUrgencies.map(urgency => ({ value: urgency, label: urgency }))
                ]}
                className="w-44"
              />
            </div>
          </div>
        </Card>
        
        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <Card key={report.id} className="transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-16 flex sm:flex-col items-center justify-center">
                    {getStatusIcon(report.status)}
                    <span className="mt-2 text-xs font-medium text-gray-500">{report.status}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.type}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyClass(report.urgency)}`}>
                            {report.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{report.description}</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{formatDate(report.reportedAt)}</span>
                        <span className="mx-1">•</span>
                        <span>{getTimeSince(report.reportedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                        <span>{report.peopleAffected} people affected</span>
                      </div>
                      {report.hasMedia && (
                        <div className="flex items-center text-primary-600">
                          <Camera className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>Media available</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ExternalLink className="h-4 w-4" />}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyReports;
