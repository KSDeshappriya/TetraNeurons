import React, { useState } from 'react';
import { Users, Search, Filter, UserPlus, MapPin, Shield, Award, CheckCircle, Clock, Calendar, AlertCircle, Phone, Mail, Building, UserCheck, MessageCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import StatCard from '../../components/ui/StatCard';
import Alert from '../../components/ui/Alert';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  status: 'available' | 'deployed' | 'off-duty' | 'training';
  phone: string;
  email: string;
  avatar: string;
}

interface Team {
  id: string;
  name: string;
  type: string;
  members: TeamMember[];
  status: 'active' | 'standby' | 'rest';
  currentAssignment?: string;
  assignmentLocation?: string;
  lastActive: string;
  leadId: string;
}

const mockTeamMembers: Record<string, TeamMember[]> = {
  'TEAM-001': [
    {
      id: 'EMP-001',
      name: 'Alex Johnson',
      role: 'Team Lead',
      specialization: 'Rescue Operations',
      status: 'deployed',
      phone: '+1 (555) 123-4567',
      email: 'alex.j@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff'
    },
    {
      id: 'EMP-002',
      name: 'Morgan Chen',
      role: 'Medical Specialist',
      specialization: 'Emergency Medicine',
      status: 'deployed',
      phone: '+1 (555) 987-6543',
      email: 'morgan.c@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Morgan+Chen&background=5B21B6&color=fff'
    },
    {
      id: 'EMP-003',
      name: 'Taylor Wilson',
      role: 'Communications',
      specialization: 'Crisis Comms',
      status: 'deployed',
      phone: '+1 (555) 456-7890',
      email: 'taylor.w@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Taylor+Wilson&background=047857&color=fff'
    },
    {
      id: 'EMP-004',
      name: 'Jamie Rivera',
      role: 'Equipment Specialist',
      specialization: 'Water Rescue',
      status: 'deployed',
      phone: '+1 (555) 234-5678',
      email: 'jamie.r@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Jamie+Rivera&background=B45309&color=fff'
    }
  ],
  'TEAM-002': [
    {
      id: 'EMP-005',
      name: 'Sam Park',
      role: 'Team Lead',
      specialization: 'Hazmat',
      status: 'available',
      phone: '+1 (555) 567-8901',
      email: 'sam.p@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Sam+Park&background=0E7490&color=fff'
    },
    {
      id: 'EMP-006',
      name: 'Jordan Lee',
      role: 'Safety Officer',
      specialization: 'Industrial Hazards',
      status: 'available',
      phone: '+1 (555) 678-9012',
      email: 'jordan.l@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Jordan+Lee&background=9333EA&color=fff'
    },
    {
      id: 'EMP-007',
      name: 'Riley Smith',
      role: 'Hazmat Technician',
      specialization: 'Chemical Safety',
      status: 'available',
      phone: '+1 (555) 789-0123',
      email: 'riley.s@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Riley+Smith&background=BE185D&color=fff'
    }
  ],
  'TEAM-003': [
    {
      id: 'EMP-008',
      name: 'Quinn Morris',
      role: 'Team Lead',
      specialization: 'Urban Search',
      status: 'training',
      phone: '+1 (555) 890-1234',
      email: 'quinn.m@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Quinn+Morris&background=0369A1&color=fff'
    },
    {
      id: 'EMP-009',
      name: 'Avery Thompson',
      role: 'Search Specialist',
      specialization: 'K-9 Unit',
      status: 'training',
      phone: '+1 (555) 901-2345',
      email: 'avery.t@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Avery+Thompson&background=7C2D12&color=fff'
    },
    {
      id: 'EMP-010',
      name: 'Casey Rodriguez',
      role: 'Rescue Technician',
      specialization: 'Structural Collapse',
      status: 'off-duty',
      phone: '+1 (555) 012-3456',
      email: 'casey.r@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Casey+Rodriguez&background=4338CA&color=fff'
    },
    {
      id: 'EMP-011',
      name: 'Reese Goldman',
      role: 'Medical Support',
      specialization: 'Trauma Care',
      status: 'training',
      phone: '+1 (555) 345-6789',
      email: 'reese.g@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Reese+Goldman&background=065F46&color=fff'
    }
  ],
  'TEAM-004': [
    {
      id: 'EMP-012',
      name: 'Drew Campbell',
      role: 'Team Lead',
      specialization: 'Fire Response',
      status: 'available',
      phone: '+1 (555) 456-7891',
      email: 'drew.c@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Drew+Campbell&background=B91C1C&color=fff'
    },
    {
      id: 'EMP-013',
      name: 'Skyler Patel',
      role: 'Fire Specialist',
      specialization: 'Structural Fires',
      status: 'available',
      phone: '+1 (555) 567-8912',
      email: 'skyler.p@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Skyler+Patel&background=DC2626&color=fff'
    },
    {
      id: 'EMP-014',
      name: 'Finley Davis',
      role: 'Equipment Operator',
      specialization: 'Pump Operations',
      status: 'off-duty',
      phone: '+1 (555) 678-9123',
      email: 'finley.d@response.org',
      avatar: 'https://ui-avatars.com/api/?name=Finley+Davis&background=991B1B&color=fff'
    }
  ]
};

const mockTeams: Team[] = [
  {
    id: 'TEAM-001',
    name: 'Alpha Rescue Team',
    type: 'Flood Response',
    members: mockTeamMembers['TEAM-001'],
    status: 'active',
    currentAssignment: 'Riverside District Evacuation',
    assignmentLocation: 'Riverside District, Central Zone',
    lastActive: '2023-07-15T08:30:00Z',
    leadId: 'EMP-001'
  },
  {
    id: 'TEAM-002',
    name: 'Bravo Hazmat Unit',
    type: 'Hazmat',
    members: mockTeamMembers['TEAM-002'],
    status: 'standby',
    lastActive: '2023-07-14T15:45:00Z',
    leadId: 'EMP-005'
  },
  {
    id: 'TEAM-003',
    name: 'Charlie Search Team',
    type: 'Search & Rescue',
    members: mockTeamMembers['TEAM-003'],
    status: 'rest',
    lastActive: '2023-07-13T22:10:00Z',
    leadId: 'EMP-008'
  },
  {
    id: 'TEAM-004',
    name: 'Delta Fire Response',
    type: 'Fire Response',
    members: mockTeamMembers['TEAM-004'],
    status: 'standby',
    lastActive: '2023-07-14T18:20:00Z',
    leadId: 'EMP-012'
  }
];

const Teams: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Team statistics
  const activeTeams = mockTeams.filter(team => team.status === 'active').length;
  const standbyTeams = mockTeams.filter(team => team.status === 'standby').length;
  const totalMembers = mockTeams.reduce((acc, team) => acc + team.members.length, 0);

  const filterTeams = () => {
    return mockTeams.filter(team => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.currentAssignment && team.currentAssignment.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesType = typeFilter === 'all' || team.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredTeams = filterTeams();

  const teamTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Flood Response', label: 'Flood Response' },
    { value: 'Hazmat', label: 'Hazmat' },
    { value: 'Search & Rescue', label: 'Search & Rescue' },
    { value: 'Fire Response', label: 'Fire Response' },
    { value: 'Medical', label: 'Medical' }
  ];

  const teamStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'standby', label: 'Standby' },
    { value: 'rest', label: 'Rest' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emergency-600 bg-emergency-100';
      case 'standby':
        return 'text-primary-600 bg-primary-100';
      case 'rest':
        return 'text-success-600 bg-success-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-success-600 bg-success-100';
      case 'deployed':
        return 'text-emergency-600 bg-emergency-100';
      case 'off-duty':
        return 'text-gray-600 bg-gray-100';
      case 'training':
        return 'text-primary-600 bg-primary-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTeamIcon = (type: string) => {
    switch (type) {
      case 'Flood Response':
        return <Shield className="h-5 w-5 text-primary-500" />;
      case 'Hazmat':
        return <Shield className="h-5 w-5 text-warning-500" />;
      case 'Search & Rescue':
        return <Shield className="h-5 w-5 text-success-500" />;
      case 'Fire Response':
        return <Shield className="h-5 w-5 text-emergency-500" />;
      case 'Medical':
        return <Shield className="h-5 w-5 text-info-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTeamLead = (team: Team) => {
    return team.members.find(member => member.id === team.leadId);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Response Teams</h1>
        <p className="text-gray-600 mt-1">Manage and coordinate response teams in the field</p>
      </div>

      {/* Alert for team status update */}
      <Alert 
        type="info"
        title="Team Update"
        message="Alpha Rescue Team has been deployed to Riverside District for evacuation assistance."
        className="mb-6"
      />

      {/* Team statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Active Teams"
          value={activeTeams}
          icon={<Users className="h-6 w-6" />}
          trend={1}
          trendLabel="from yesterday"
          trendType="up"
          bgColor="bg-emergency-50"
          iconColor="text-emergency-600"
        />
        <StatCard 
          title="Standby Teams"
          value={standbyTeams}
          icon={<Users className="h-6 w-6" />}
          trend={0}
          trendLabel="from yesterday"
          trendType="same"
          bgColor="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard 
          title="Total Personnel"
          value={totalMembers}
          icon={<Users className="h-6 w-6" />}
          trend={0}
          trendLabel="from yesterday"
          trendType="same"
          bgColor="bg-secondary-50"
          iconColor="text-secondary-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Teams list */}
          <Card className="mb-6">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Response Teams</h2>
                <Button 
                  variant="primary" 
                  onClick={() => {}}
                  className="mt-2 md:mt-0 flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  New Team
                </Button>
              </div>
              
              {/* Search and filters */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={teamTypeOptions}
                    label="Team Type"
                    hideLabel
                  />
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={teamStatusOptions}
                    label="Status"
                    hideLabel
                  />
                </div>
              </div>
              
              {/* Teams list */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                {filteredTeams.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredTeams.map((team) => (
                      <div 
                        key={team.id} 
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTeam?.id === team.id ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelectedTeam(team)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              {getTeamIcon(team.type)}
                              <h3 className="ml-2 text-sm font-medium text-gray-900">{team.name}</h3>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">{team.type} • {team.members.length} members</div>
                            {team.currentAssignment && (
                              <div className="mt-1 text-xs text-gray-800 font-medium">
                                Assignment: {team.currentAssignment}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(team.status)}`}>
                            {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex -space-x-2 overflow-hidden">
                          {team.members.slice(0, 4).map((member) => (
                            <img 
                              key={member.id}
                              src={member.avatar}
                              alt={member.name}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                            />
                          ))}
                          {team.members.length > 4 && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 ring-2 ring-white text-xs font-medium text-gray-800">
                              +{team.members.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No teams matching your filters
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          {/* Quick actions */}
          <Card>
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => {}} 
                  className="w-full flex items-center justify-center"
                >
                  <Users className="mr-2 h-5 w-5" />
                  View All Personnel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {}} 
                  className="w-full flex items-center justify-center"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Track Team Locations
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {}} 
                  className="w-full flex items-center justify-center"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Send Emergency Broadcast
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {/* Team details */}
          {selectedTeam ? (
            <Card>
              <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center">
                      {getTeamIcon(selectedTeam.type)}
                      <h2 className="ml-2 text-xl font-semibold text-gray-900">{selectedTeam.name}</h2>
                      <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTeam.status)}`}>
                        {selectedTeam.status.charAt(0).toUpperCase() + selectedTeam.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">ID: {selectedTeam.id} • {selectedTeam.type}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 space-x-2">
                    <Button 
                      variant={selectedTeam.status === 'active' ? 'secondary' : 'primary'} 
                      onClick={() => {}}
                    >
                      {selectedTeam.status === 'active' ? 'Recall Team' : 'Deploy Team'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {}}
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
                
                {selectedTeam.currentAssignment && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Current Assignment
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>{selectedTeam.currentAssignment}</p>
                          {selectedTeam.assignmentLocation && (
                            <div className="flex items-center mt-1 text-blue-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              {selectedTeam.assignmentLocation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Team lead info */}
                {getTeamLead(selectedTeam) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Team Lead</h3>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={getTeamLead(selectedTeam)?.avatar}
                        alt={getTeamLead(selectedTeam)?.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getTeamLead(selectedTeam)?.name}</div>
                        <div className="text-sm text-gray-500">{getTeamLead(selectedTeam)?.role}</div>
                        <div className="text-xs text-gray-500 mt-1">Specialization: {getTeamLead(selectedTeam)?.specialization}</div>
                      </div>
                      <div className="ml-auto space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {}}
                          className="flex items-center"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Team members */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Team Members ({selectedTeam.members.length})</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {}}
                    >
                      Manage Team
                    </Button>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTeam.members.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img 
                                  src={member.avatar}
                                  alt={member.name}
                                  className="h-8 w-8 rounded-full"
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                  <div className="text-xs text-gray-500">ID: {member.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{member.role}</div>
                              <div className="text-xs text-gray-500">{member.specialization}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMemberStatusColor(member.status)}`}>
                                {member.status === 'off-duty' ? 'Off Duty' : 
                                 member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <a href={`tel:${member.phone}`} className="text-primary-600 hover:text-primary-800">
                                  <Phone className="h-4 w-4" />
                                </a>
                                <a href={`mailto:${member.email}`} className="text-primary-600 hover:text-primary-800">
                                  <Mail className="h-4 w-4" />
                                </a>
                                <button className="text-primary-600 hover:text-primary-800">
                                  <MessageCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Team activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-800">Team deployed to Riverside District for evacuation assistance</p>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date().toLocaleDateString()}
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-success-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-800">Equipment check completed - All items operational</p>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date().toLocaleDateString()}
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-info-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-info-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-800">Team briefing conducted at Command Center</p>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date().toLocaleDateString()}
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-10">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Select a team</h3>
                <p className="text-gray-500">
                  Choose a team from the list to view detailed information and manage team members
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
