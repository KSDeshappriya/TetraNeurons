import React from 'react';
import { 
  Book, 
  FileText, 
  Users, 
  Video, 
  MessageCircle, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Download,
  PlayCircle,
  Clock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'document' | 'link' | 'training';
  category: 'skills' | 'safety' | 'communication' | 'coordination';
  thumbnail?: string;
  url: string;
  duration?: string;
  dateAdded: string;
  isNew: boolean;
  isCompleted?: boolean;
}

const VolunteerResources: React.FC = () => {
  const location = useLocation();
  
  // Mock data for volunteer resources
  const resources: Resource[] = [
    {
      id: 'res-001',
      title: 'Volunteer Safety Guidelines',
      description: 'Important safety protocols for all volunteers during disaster response operations.',
      type: 'document',
      category: 'safety',
      url: '/resources/volunteer-safety-guidelines.pdf',
      dateAdded: '2023-05-20',
      isNew: false,
      isCompleted: true
    },
    {
      id: 'res-002',
      title: 'Communication During Crisis',
      description: 'Learn effective communication techniques for disaster situations.',
      type: 'training',
      category: 'communication',
      thumbnail: '/images/training-comm.jpg',
      url: '/training/communication-crisis',
      duration: '45 min',
      dateAdded: '2023-06-01',
      isNew: true,
      isCompleted: false
    },
    {
      id: 'res-003',
      title: 'First Aid Basics',
      description: 'Essential first aid skills for emergency situations.',
      type: 'video',
      category: 'skills',
      thumbnail: '/images/first-aid.jpg',
      url: '/videos/first-aid-basics',
      duration: '32 min',
      dateAdded: '2023-05-15',
      isNew: false,
      isCompleted: true
    },
    {
      id: 'res-004',
      title: 'Team Coordination Strategies',
      description: 'How to coordinate effectively with other volunteers and first responders.',
      type: 'guide',
      category: 'coordination',
      url: '/guides/team-coordination',
      dateAdded: '2023-06-10',
      isNew: true,
      isCompleted: false
    },
    {
      id: 'res-005',
      title: 'Psychological First Aid',
      description: 'How to provide emotional support to disaster victims.',
      type: 'training',
      category: 'skills',
      thumbnail: '/images/psych-firstaid.jpg',
      url: '/training/psychological-first-aid',
      duration: '60 min',
      dateAdded: '2023-05-28',
      isNew: false,
      isCompleted: false
    },
    {
      id: 'res-006',
      title: 'Emergency Shelter Setup',
      description: 'Guide for setting up and managing temporary shelters.',
      type: 'document',
      category: 'skills',
      url: '/resources/shelter-setup-guide.pdf',
      dateAdded: '2023-06-05',
      isNew: true,
      isCompleted: false
    }
  ];

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get icon based on resource type
  const getResourceIcon = (type: string, className: string = 'h-6 w-6') => {
    switch (type) {
      case 'guide':
        return <Book className={className} />;
      case 'document':
        return <FileText className={className} />;
      case 'video':
        return <Video className={className} />;
      case 'training':
        return <Users className={className} />;
      case 'link':
        return <ExternalLink className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  // Get action button based on resource type
  const getActionButton = (resource: Resource) => {
    switch (resource.type) {
      case 'document':
        return (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download />}
          >
            Download
          </Button>
        );
      case 'video':
        return (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlayCircle />}
          >
            Watch Video
          </Button>
        );
      case 'training':
        return (
          <Button
            variant={resource.isCompleted ? "success" : "primary"}
            size="sm"
            leftIcon={resource.isCompleted ? <CheckCircle2 /> : <PlayCircle />}
          >
            {resource.isCompleted ? "Continue Training" : "Start Training"}
          </Button>
        );
      default:
        return (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ArrowRight />}
          >
            View Resource
          </Button>
        );
    }
  };

  // Get category label and color
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'safety':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emergency-100 text-emergency-800 border border-emergency-200">
            Safety
          </span>
        );
      case 'communication':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
            Communication
          </span>
        );
      case 'skills':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
            Skills
          </span>
        );
      case 'coordination':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
            Coordination
          </span>
        );
      default:
        return null;
    }
  };

  // Group resources by category for featured section
  const safetyResources = resources.filter(r => r.category === 'safety');
  const skillsResources = resources.filter(r => r.category === 'skills');
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <Link
              to="/volunteer/assignments"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/volunteer/assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Assignments
            </Link>
            <Link
              to="/volunteer/resources"
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/volunteer/resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resources
            </Link>
          </nav>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Resources</h1>
          <p className="text-gray-600 mt-1">Access training materials, guides and resources to help with disaster response</p>
        </div>

        {/* Featured Resources */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Resources</h2>
            <Button
              variant="outline"
              size="sm"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {resources.filter(r => r.isNew).slice(0, 3).map(resource => (
              <div key={resource.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  {resource.thumbnail ? (
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      {getResourceIcon(resource.type, 'h-12 w-12')}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {getCategoryBadge(resource.category)}
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      New
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    {resource.duration && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {resource.duration}
                      </span>
                    )}
                    {getActionButton(resource)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-3 p-3 rounded-full bg-primary-100 text-primary-600">
                <Book className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Training Materials</h3>
              <p className="text-sm text-gray-600 mb-4">Access courses and training resources</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Training
              </Button>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-3 p-3 rounded-full bg-success-100 text-success-600">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Guides & Manuals</h3>
              <p className="text-sm text-gray-600 mb-4">Download procedure documents and guides</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Guides
              </Button>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-3 p-3 rounded-full bg-warning-100 text-warning-600">
                <Video className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-4">Watch instructional videos and tutorials</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Videos
              </Button>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-3 p-3 rounded-full bg-emergency-100 text-emergency-600">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Community Forum</h3>
              <p className="text-sm text-gray-600 mb-4">Connect with other volunteers and share tips</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                Join Discussion
              </Button>
            </div>
          </Card>
        </div>

        {/* Latest Resources and Upcoming Events */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Latest Resources</h2>
                <Button
                  variant="outline"
                  size="sm"
                >
                  View All
                </Button>
              </div>

              <div className="divide-y divide-gray-200">
                {resources.slice(0, 5).map(resource => (
                  <div key={resource.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        {resource.isNew && (
                          <span className="mr-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        {getCategoryBadge(resource.category)}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Added {formatDate(resource.dateAdded)}
                          {resource.duration && (
                            <>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              {resource.duration}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getActionButton(resource)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Training Events</h2>
              </div>

              <div className="divide-y divide-gray-200">
                <div className="py-3 first:pt-0">
                  <span className="text-xs font-medium text-primary-600 mb-1 block">June 25, 2023 • Online</span>
                  <h3 className="font-medium text-gray-900 mb-1">Disaster First Aid Certification</h3>
                  <p className="text-xs text-gray-600 mb-2">Learn essential first aid skills for disaster response.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Calendar />}
                  >
                    Register
                  </Button>
                </div>

                <div className="py-3">
                  <span className="text-xs font-medium text-primary-600 mb-1 block">July 2, 2023 • Central Community Center</span>
                  <h3 className="font-medium text-gray-900 mb-1">Emergency Communication Workshop</h3>
                  <p className="text-xs text-gray-600 mb-2">Join us for a hands-on workshop on emergency communication systems.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Calendar />}
                  >
                    Register
                  </Button>
                </div>

                <div className="py-3 last:pb-0">
                  <span className="text-xs font-medium text-primary-600 mb-1 block">July 10, 2023 • Online</span>
                  <h3 className="font-medium text-gray-900 mb-1">Psychological Support Training</h3>
                  <p className="text-xs text-gray-600 mb-2">Learn how to provide emotional support to disaster victims.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Calendar />}
                  >
                    Register
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <Button
                  variant="primary"
                  size="sm"
                >
                  View All Events
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerResources;
