import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ArrowRight,
  PlusCircle
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

      {/* Dashboard Tabs */}
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
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{incident.type}</h3>
                      <span className={`${getStatusBadgeClasses(incident.status)} px-2 py-1 rounded-full text-xs`}>
                        {incident.status}
                      </span>
                      <span className={`${getPriorityBadgeClasses(incident.priority)} ml-2 px-2 py-1 rounded-full text-xs`}>
                        {incident.priority}
                      </span>
                    </div>
                    <p className="text-gray-600">{incident.location}</p>
                    <p className="text-sm text-gray-500">Reported {incident.reportTime}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">People Affected</p>
                      <p className="text-lg font-medium text-gray-900">{incident.peopleAffected}</p>
                    </div>
                    <Button variant="primary" size="sm">View Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{resource.name}</h3>
                      <span className={`${getStatusBadgeClasses(resource.status)} px-2 py-1 rounded-full text-xs`}>
                        {resource.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{resource.type}</p>
                    <p className="text-sm text-gray-500">Location: {resource.location}</p>
                  </div>
                  <Button variant="outline" size="sm">Manage Resource</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{team.name}</h3>
                      <span className={`${getStatusBadgeClasses(team.status)} px-2 py-1 rounded-full text-xs`}>
                        {team.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{team.members} Team Members</p>
                    {team.assignedIncident && (
                      <p className="text-sm text-gray-500">Assigned to: {team.assignedIncident}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">View Team</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstResponderDashboard;
