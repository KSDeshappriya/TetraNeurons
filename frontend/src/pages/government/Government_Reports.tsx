import React, { useState } from 'react';
import { Search, Filter, Download, BarChart3, Map as MapIcon, FileText, AlertTriangle, Clock, MapPin, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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

const Government_Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const totalReports = mockReports.length;
  const verifiedReports = mockReports.filter(report => report.status === 'verified').length;
  const highPriorityReports = mockReports.filter(report => report.priority === 'high').length;
  const pendingReports = mockReports.filter(report => report.status === 'submitted').length;

  // Filter reports based on active tab and search term
  const filteredReports = mockReports.filter(report => {
    const matchesTab = activeTab === 'all' 
      || (activeTab === 'pending' && report.status === 'submitted')
      || (activeTab === 'verified' && report.status === 'verified')
      || (activeTab === 'archived' && report.status === 'resolved');

    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Track and manage emergency reports and incidents</p>
      </div>

      {/* Alert for high priority report */}
      <Alert 
        variant="warning"
        title="Critical Report Received"
        description="New high priority report: Gas Leak in Downtown Area requires immediate verification."
        className="mb-6"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Reports"
          value={totalReports}
          icon={FileText}
          footer="Total emergency reports"
        />
        <StatCard 
          title="Verified Reports"
          value={verifiedReports}
          icon={Check}
          footer="Verified emergency reports"
          variant="success"
        />
        <StatCard 
          title="High Priority"
          value={highPriorityReports}
          icon={AlertTriangle}
          footer="High priority reports"
          variant="emergency"
        />
        <StatCard 
          title="Pending Verification"
          value={pendingReports}
          icon={Clock}
          footer="Reports needing verification"
          variant="warning"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Verification
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'verified'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Verified Reports
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'archived'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archived Reports
          </button>
        </nav>
      </div>

      {/* Actions and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.priority === 'high' 
                        ? 'bg-emergency-100 text-emergency-800'
                        : report.priority === 'medium'
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-success-100 text-success-800'
                    }`}>
                      {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'submitted' 
                        ? 'bg-warning-100 text-warning-800'
                        : report.status === 'verified'
                        ? 'bg-success-100 text-success-800'
                        : report.status === 'flagged'
                        ? 'bg-emergency-100 text-emergency-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(report.submittedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Report Categories */}
        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Categories</h3>
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
              {/* Add more categories */}
            </div>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
            <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Geographic distribution map</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Response Time Analysis */}
        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Analysis</h3>
            <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Response time analysis chart</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Government_Reports;
