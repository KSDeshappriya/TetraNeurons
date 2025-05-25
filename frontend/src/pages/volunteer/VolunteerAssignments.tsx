import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  CalendarCheck, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  ClipboardCheck,
  Filter,
  Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface Assignment {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  coordinator: string;
  requiredSkills: string[];
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
}

const VolunteerAssignments: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>('upcoming');

  // Mock data
  const assignments: Assignment[] = [
    {
      id: 'ASN-001',
      title: 'Food Distribution',
      description: 'Distribute meals and water to affected residents in the Downtown shelter.',
      location: 'Central Community Center, Downtown',
      date: '2023-06-18',
      startTime: '09:00',
      endTime: '13:00',
      status: 'pending',
      coordinator: 'Sarah Johnson',
      requiredSkills: ['Food Handling', 'Customer Service'],
      teamSize: 8,
      priority: 'high'
    },
    {
      id: 'ASN-002',
      title: 'Medical Supply Sorting',
      description: 'Sort and organize medical supplies for distribution to local clinics.',
      location: 'Main Hospital Storage, East Wing',
      date: '2023-06-20',
      startTime: '14:00',
      endTime: '17:00',
      status: 'pending',
      coordinator: 'Dr. Michael Chen',
      requiredSkills: ['Inventory Management', 'Medical Knowledge'],
      teamSize: 5,
      priority: 'medium'
    },
    {
      id: 'ASN-003',
      title: 'Shelter Setup',
      description: 'Help set up cots, blankets, and basic amenities at the new temporary shelter.',
      location: 'Westside High School Gymnasium',
      date: '2023-06-17',
      startTime: '08:00',
      endTime: '16:00',
      status: 'active',
      coordinator: 'Robert Lewis',
      requiredSkills: ['Physical Labor', 'Organization'],
      teamSize: 12,
      priority: 'high'
    },
    {
      id: 'ASN-004',
      title: 'Child Care Assistance',
      description: 'Provide supervision and activities for children at the family shelter.',
      location: 'Family Relief Center, North District',
      date: '2023-06-19',
      startTime: '10:00',
      endTime: '15:00',
      status: 'pending',
      coordinator: 'Jessica Perez',
      requiredSkills: ['Childcare Experience', 'First Aid'],
      teamSize: 6,
      priority: 'medium'
    },
    {
      id: 'ASN-005',
      title: 'Debris Clearing',
      description: 'Help clear debris from roads to improve access for emergency vehicles.',
      location: 'Riverside Neighborhood',
      date: '2023-06-15',
      startTime: '07:00',
      endTime: '14:00',
      status: 'completed',
      coordinator: 'Mark Wilson',
      requiredSkills: ['Physical Labor', 'Equipment Operation'],
      teamSize: 15,
      priority: 'high'
    }
  ];

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emergency-100 text-emergency-800 border border-emergency-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
            Medium Priority
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
            Low Priority
          </span>
        );
      default:
        return null;
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = searchQuery === '' ||
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;
    const matchesTab = selectedTab === 'upcoming' 
      ? ['active', 'pending'].includes(assignment.status)
      : assignment.status === 'completed';
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <Link
              to="/volunteer"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/volunteer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/volunteer/assignments"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname.includes('/volunteer/assignments')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assignments
            </Link>
            <Link
              to="/volunteer/resources"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname.includes('/volunteer/resources')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resources
            </Link>
            <Link
              to="/volunteer/communication"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname.includes('/volunteer/communication')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Communication
            </Link>
            <Link
              to="/volunteer/training"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname.includes('/volunteer/training')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training
            </Link>
          </nav>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Assignments</h1>
          <p className="text-gray-600 mt-1">View and manage your volunteer assignments for disaster response</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'upcoming'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Assignments
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Assignments
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                label=""
                placeholder="Search assignments..."
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
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                className="w-40"
              />
              
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' }
                ]}
                className="w-40"
              />
            </div>
          </div>
        </Card>
        
        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map(assignment => (
              <Card key={assignment.id} className="transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-16 flex sm:flex-col items-center justify-center text-primary-600">
                    {assignment.status === 'completed' ? (
                      <CheckCircle2 className="h-10 w-10" />
                    ) : (
                      <CalendarCheck className="h-10 w-10" />
                    )}
                    <div className="mt-2 text-center">
                      <div className="text-xs font-semibold text-gray-900">{formatDate(assignment.date).split(',')[0]}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                          {getStatusBadge(assignment.status)}
                          {getPriorityBadge(assignment.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{formatDate(assignment.date)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <span className="font-medium">Time: </span>
                          {assignment.startTime} - {assignment.endTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <span className="font-medium">Location: </span>
                          {assignment.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <span className="font-medium">Team: </span>
                          {assignment.teamSize} volunteers
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {assignment.requiredSkills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Coordinator: </span>
                        {assignment.coordinator}
                      </div>
                      
                      {assignment.status === 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<ClipboardCheck />}
                        >
                          View Details
                        </Button>
                      ) : assignment.status === 'active' ? (
                        <div className="space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<AlertTriangle />}
                          >
                            Report Issue
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            leftIcon={<CheckCircle2 />}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      ) : (
                        <div className="space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle2 />}
                          >
                            Accept Assignment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {selectedTab === 'upcoming' ? "No upcoming assignments" : "No completed assignments"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {selectedTab === 'upcoming'
                  ? "Check back later for new volunteer opportunities or adjust your filter settings."
                  : "You haven't completed any assignments yet. Once you complete an assignment, it will appear here."}
              </p>
              {selectedTab === 'upcoming' && (
                <Button
                  variant="primary"
                  className="mt-4"
                >
                  Find Volunteer Opportunities
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerAssignments;
