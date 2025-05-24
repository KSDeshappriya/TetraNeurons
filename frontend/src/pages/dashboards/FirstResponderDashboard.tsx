import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { 
  Users, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2,
  BarChart3,
  Truck,
  Radio,
  ClipboardCheck,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

interface EmergencyIncident {
  id: string;
  type: string;
  location: string;
  reportTime: string;
  status: 'critical' | 'active' | 'contained' | 'resolved';
  peopleAffected: number;
  assignedTeam?: string;
  priority: 'high' | 'medium' | 'low';
}

interface Resource {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'deployed' | 'maintenance';
  location: string;
}

interface Team {
  id: string;
  name: string;
  members: number;
  status: 'available' | 'deployed' | 'standby';
  assignedIncident?: string;
}

const FirstResponderDashboard: React.FC = () => {
  const token = authService.getTokenPayload();
  const [activeTab, setActiveTab] = useState<'incidents' | 'resources' | 'teams'>('incidents');

  // Mock data
  const incidents: EmergencyIncident[] = [
    {
      id: 'INC-2023-001',
      type: 'Flooding',
      location: 'Downtown River District',
      reportTime: '10 minutes ago',
      status: 'critical',
      peopleAffected: 120,
      assignedTeam: 'Alpha Response Team',
      priority: 'high'
    },
    {
      id: 'INC-2023-002',
      type: 'Building Collapse',
      location: 'Westside Commercial Zone',
      reportTime: '45 minutes ago',
      status: 'active',
      peopleAffected: 15,
      assignedTeam: 'Bravo Rescue Unit',
      priority: 'high'
    },
    {
      id: 'INC-2023-003',
      type: 'Fire',
      location: 'North Residential Area',
      reportTime: '2 hours ago',
      status: 'contained',
      peopleAffected: 30,
      assignedTeam: 'Charlie Fire Response',
      priority: 'medium'
    }
  ];

  const resources: Resource[] = [
    { id: 'RES-001', name: 'Mobile Command Center', type: 'Vehicle', status: 'deployed', location: 'Downtown River District' },
    { id: 'RES-002', name: 'Emergency Generator', type: 'Equipment', status: 'available', location: 'Central Depot' },
    { id: 'RES-003', name: 'Water Rescue Craft', type: 'Vehicle', status: 'available', location: 'East Harbor' },
    { id: 'RES-004', name: 'Medical Supply Kit', type: 'Equipment', status: 'deployed', location: 'Westside Commercial Zone' }
  ];

  const teams: Team[] = [
    { id: 'TM-001', name: 'Alpha Response Team', members: 8, status: 'deployed', assignedIncident: 'INC-2023-001' },
    { id: 'TM-002', name: 'Bravo Rescue Unit', members: 6, status: 'deployed', assignedIncident: 'INC-2023-002' },
    { id: 'TM-003', name: 'Charlie Fire Response', members: 12, status: 'deployed', assignedIncident: 'INC-2023-003' },
    { id: 'TM-004', name: 'Delta Medical Unit', members: 5, status: 'available' }
  ];

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-emergency-100 text-emergency-800 border border-emergency-200';
      case 'active':
        return 'bg-warning-100 text-warning-800 border border-warning-200';
      case 'contained':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'resolved':
        return 'bg-success-100 text-success-700 border border-success-200';
      case 'available':
        return 'bg-success-100 text-success-700 border border-success-200';
      case 'deployed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'maintenance':
      case 'standby':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-emergency-100 text-emergency-800 border border-emergency-200';
      case 'medium':
        return 'bg-warning-100 text-warning-800 border border-warning-200';
      case 'low':
        return 'bg-success-100 text-success-700 border border-success-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {token?.name}</h1>
        <p className="text-gray-600 mt-1">First Responder Command Center</p>
      </div>

      {/* Alert for critical incidents */}
      {incidents.some(incident => incident.status === 'critical') && (
        <Alert 
          variant="error" 
          title="Critical Incidents Detected"
          className="mb-8"
        >
          There are active critical incidents requiring immediate attention.
        </Alert>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Incidents" 
          value={incidents.filter(i => i.status === 'critical' || i.status === 'active').length} 
          icon={AlertTriangle}
          variant="emergency"
        />
        <StatCard 
          title="Deployed Teams" 
          value={teams.filter(t => t.status === 'deployed').length} 
          icon={Users}
          variant="info"
        />
        <StatCard 
          title="Available Resources" 
          value={resources.filter(r => r.status === 'available').length} 
          icon={Truck}
          variant="success"
        />
        <StatCard 
          title="People Affected" 
          value={incidents.reduce((sum, incident) => sum + incident.peopleAffected, 0)} 
          icon={Users}
          variant="warning"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'incidents' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Incidents
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
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'teams' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teams
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Active Incidents</h2>
              <Button 
                variant="primary" 
                size="sm" 
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View All Incidents
              </Button>
            </div>
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{incident.type}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(incident.status)}`}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                      <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClasses(incident.priority)}`}>
                        {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)} Priority
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-1" />
                        <span>Reported {incident.reportTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-1" />
                        <span>{incident.peopleAffected} people affected</span>
                      </div>
                      {incident.assignedTeam && (
                        <div className="flex items-center">
                          <Radio className="h-4 w-4 text-gray-500 mr-1" />
                          <span>{incident.assignedTeam}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      leftIcon={<ClipboardCheck className="h-4 w-4" />}
                    >
                      Update Status
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      leftIcon={<PhoneCall className="h-4 w-4" />}
                    >
                      Contact Team
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Available Resources</h2>
              <Button 
                variant="primary" 
                size="sm" 
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Manage Resources
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                        <div className="text-xs text-gray-500">{resource.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resource.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(resource.status)}`}>
                          {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resource.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="text-primary-600 hover:text-primary-800 font-medium">
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Response Teams</h2>
              <Button 
                variant="primary" 
                size="sm" 
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Manage Teams
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(team.status)}`}>
                      {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{team.members} team members</span>
                    </div>
                    {team.assignedIncident && (
                      <div className="flex items-center text-sm text-gray-600">
                        <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
                        <span>Assigned to {team.assignedIncident}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" fullWidth>
                      View Details
                    </Button>
                    <Button 
                      variant={team.status === 'deployed' ? 'outline' : 'primary'} 
                      size="sm" 
                      fullWidth 
                      disabled={team.status === 'deployed'}
                    >
                      {team.status === 'deployed' ? 'Deployed' : 'Dispatch'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstResponderDashboard;
