import React, { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { authService } from '../../lib/auth';
import { getStatusBadgeClasses, getPriorityBadgeClasses } from '../../lib/utils';

const VolunteerDashboard: React.FC = () => {
  const token = authService.getTokenPayload();
  const [activeTab, setActiveTab] = useState<'opportunities' | 'tasks' | 'schedule'>('opportunities');

  const completedTasks = 12;
  const availableTasks = 5;
  const hoursServed = 24;
  const impactScore = 85;

  const opportunities = [
    {
      id: '1',
      title: 'Emergency Response Team',
      organization: 'Red Cross',
      urgency: 'high',
      description: 'Join our emergency response team to assist in disaster relief efforts.',
      location: 'Downtown',
      timeCommitment: '4-6 hours'
    },
    // Add more opportunities...
  ];

  const tasks = [
    {
      id: '1',
      title: 'First Aid Training',
      dueDate: '2024-02-01',
      status: 'in-progress',
      description: 'Complete the online first aid certification course.'
    },
    // Add more tasks...
  ];

  const scheduledEvents = [
    {
      id: '1',
      title: 'Community Relief Drive',
      date: '2024-01-15',
      time: '09:00 AM',
      status: 'upcoming',
      location: 'Community Center',
      duration: '3 hours'
    },
    // Add more events...
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {token?.name}</h1>
        <p className="text-gray-600 mt-1">Volunteer Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">Completed Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{completedTasks}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">Available Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{availableTasks}</p>
            </div>
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">Hours Served</p>
              <p className="text-lg font-semibold text-gray-900">{hoursServed}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">Impact Score</p>
              <p className="text-lg font-semibold text-gray-900">{impactScore}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opportunities' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Opportunities
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schedule
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{opportunity.title}</h3>
                      <p className="text-sm text-gray-500">{opportunity.organization}</p>
                    </div>
                    <span className={`bg-${opportunity.urgency}-100 text-${opportunity.urgency}-800 rounded-full px-3 py-1 text-xs font-semibold`}>
                      {opportunity.urgency}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{opportunity.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Commitment</p>
                      <p className="text-gray-900">{opportunity.timeCommitment}</p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm">Sign Up</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                    </div>
                    <span className={`${getStatusBadgeClasses(task.status)} px-2 py-1 rounded-full text-xs`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{task.description}</p>
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={task.status === 'completed'}
                    >
                      Mark Complete
                    </Button>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {scheduledEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {event.status === 'upcoming' ? 'Cancel' : 'View'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{event.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-gray-900">{event.duration}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
