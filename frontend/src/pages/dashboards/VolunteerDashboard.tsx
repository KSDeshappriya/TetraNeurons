import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Calendar,
  User,
  ClipboardList,
  Award,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { authService } from '../../services/auth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';

interface Assignment {
  id: string;
  title: string;
  type: string;
  location: string;
  startTime: string;
  duration: string;
  status: 'upcoming' | 'active' | 'completed';
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
}

interface Skill {
  name: string;
  level: string;
}

const VolunteerDashboard: React.FC = () => {
  const token = authService.getTokenPayload();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Mock data
  const assignments: Assignment[] = [
    {
      id: 'ASN-001',
      title: 'Evacuation Assistance',
      type: 'Evacuation',
      location: 'Downtown River District',
      startTime: 'Today, 2:00 PM',
      duration: '4 hours',
      status: 'upcoming',
      teamSize: 8,
      priority: 'high'
    },
    {
      id: 'ASN-002',
      title: 'Medical Supply Distribution',
      type: 'Aid Distribution',
      location: 'North Community Center',
      startTime: 'Tomorrow, 10:00 AM',
      duration: '3 hours',
      status: 'upcoming',
      teamSize: 5,
      priority: 'medium'
    },
    {
      id: 'ASN-003',
      title: 'Temporary Shelter Setup',
      type: 'Shelter',
      location: 'Central High School',
      startTime: 'Yesterday, 9:00 AM',
      duration: '6 hours',
      status: 'completed',
      teamSize: 12,
      priority: 'high'
    }
  ];

  const volunteerStats = {
    completedMissions: 24,
    hoursContributed: 86,
    peopleHelped: 312,
    currentRank: 'Senior Volunteer'
  };

  const volunteerSkills: Skill[] = [
    { name: 'First Aid', level: 'Advanced' },
    { name: 'Search & Rescue', level: 'Intermediate' },
    { name: 'Crisis Communications', level: 'Basic' },
    { name: 'Emergency Shelter Management', level: 'Intermediate' }
  ];

  const notifications = [
    'New assignment available in your area',
    'Your skill certification expires in 2 weeks',
    'Team meeting scheduled for tomorrow at 5 PM'
  ];

  const toggleAssignment = (id: string) => {
    if (selectedAssignment === id) {
      setSelectedAssignment(null);
    } else {
      setSelectedAssignment(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-primary-100 text-primary-800">In Progress</span>;
      case 'upcoming':
        return <span className="badge bg-warning-100 text-warning-800">Upcoming</span>;
      case 'completed':
        return <span className="badge bg-success-100 text-success-800">Completed</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="badge bg-emergency-100 text-emergency-800">High Priority</span>;
      case 'medium':
        return <span className="badge bg-warning-100 text-warning-800">Medium Priority</span>;
      case 'low':
        return <span className="badge bg-success-100 text-success-800">Low Priority</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">Normal</span>;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {token?.name}</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Completed Missions" 
          value={volunteerStats.completedMissions} 
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard 
          title="Hours Contributed" 
          value={volunteerStats.hoursContributed} 
          icon={Clock}
          variant="info"
        />
        <StatCard 
          title="People Helped" 
          value={volunteerStats.peopleHelped} 
          icon={Users}
          variant="warning"
        />
        <StatCard 
          title="Current Rank" 
          value={volunteerStats.currentRank} 
          icon={Award}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Your Assignments" 
            subtitle="Current and upcoming volunteer tasks"
            headerAction={
              <Button 
                variant="outline" 
                size="sm"
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                View All
              </Button>
            }
          >
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id}
                  className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedAssignment === assignment.id 
                      ? 'border-primary-300 shadow-soft' 
                      : 'border-gray-200 hover:border-primary-200'
                  }`}
                >
                  {/* Assignment Header */}
                  <button 
                    className="w-full px-4 py-3 text-left flex flex-wrap items-center justify-between gap-2"
                    onClick={() => toggleAssignment(assignment.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {assignment.type === 'Evacuation' && <AlertTriangle className="h-5 w-5 text-emergency-500" />}
                      {assignment.type === 'Aid Distribution' && <ClipboardList className="h-5 w-5 text-primary-500" />}
                      {assignment.type === 'Shelter' && <Users className="h-5 w-5 text-warning-500" />}
                      <span className="font-medium text-gray-900">{assignment.title}</span>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(assignment.status)}
                      {getPriorityBadge(assignment.priority)}
                    </div>
                  </button>

                  {/* Assignment Details (Expanded) */}
                  {selectedAssignment === assignment.id && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium text-gray-700">Location</p>
                            <p className="text-gray-600">{assignment.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium text-gray-700">Time</p>
                            <p className="text-gray-600">{assignment.startTime}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium text-gray-700">Duration</p>
                            <p className="text-gray-600">{assignment.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Users className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium text-gray-700">Team Size</p>
                            <p className="text-gray-600">{assignment.teamSize} volunteers</p>
                          </div>
                        </div>
                      </div>

                      {assignment.status !== 'completed' && (
                        <div className="mt-4 flex gap-2 justify-end">
                          <Button 
                            variant="primary" 
                            size="sm"
                          >
                            {assignment.status === 'active' ? 'Check In' : 'View Details'}
                          </Button>
                          <Button 
                            variant={assignment.status === 'active' ? 'emergency' : 'secondary'} 
                            size="sm"
                          >
                            {assignment.status === 'active' ? 'Report Issue' : 'Request Change'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {assignments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assignments scheduled</p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="mt-4"
                  >
                    Browse Available Tasks
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile & Skills */}
          <Card 
            title="Your Profile" 
            headerAction={
              <Button 
                variant="ghost" 
                size="sm"
              >
                Edit
              </Button>
            }
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{token?.name}</h3>
                <p className="text-sm text-gray-600">{volunteerStats.currentRank}</p>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Skills</h4>
              <div className="space-y-2">
                {volunteerSkills.map((skill) => (
                  <div key={skill.name} className="flex justify-between">
                    <span className="text-sm text-gray-600">{skill.name}</span>
                    <span className="text-sm font-medium text-gray-900">{skill.level}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-4"
              >
                Add New Skill
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notifications">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification, index) => (
                <li key={index} className="py-2">
                  <div className="flex">
                    <span className="mr-2 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                    </span>
                    <span className="text-sm text-gray-600">{notification}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              size="sm"
              fullWidth
              className="mt-3"
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Open Communication Hub
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
