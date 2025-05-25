import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';
import NavigationBar from '../../components/layout/Navigationbar';
import { Dialog, Transition } from '@headlessui/react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface EmergencyRequest {
  id: string;
  emergencyType: string;
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  situation: string;
  peopleCount: number;
  latitude: number;
  longitude: number;
  image?: string;
  submittedAt: string;
  submittedBy: string;
  contactInfo: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

const EmergencyRequestReview: React.FC = () => {
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  const [confirmAction, setConfirmAction] = useState<{ open: boolean; action: 'accept' | 'reject' | null }>({ open: false, action: null });
  const navigate = useNavigate();

  // Mock emergency request data - in real app, this would come from props or API
  useEffect(() => {
    // Simulate loading emergency request data
    const mockRequest: EmergencyRequest = {
      id: 'REQ-2023-015',
      emergencyType: 'Earthquake',
      urgencyLevel: 'Critical',
      situation: 'Major earthquake has struck downtown area. Multiple buildings collapsed, people trapped under debris. Immediate rescue operations needed. Can hear people calling for help from beneath the rubble.',
      peopleCount: 50,
      latitude: 37.7749,
      longitude: -122.4194,
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', // Placeholder base64 image
      submittedAt: '2023-10-15T14:30:00Z',
      submittedBy: 'John Smith',
      contactInfo: '+1 (555) 123-4567',
      status: 'Pending'
    };
    setRequest(mockRequest);
  }, []);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'earthquake': return '🏢';
      case 'fire': return '🔥';
      case 'flood': return '🌊';
      case 'accident': return '🚗';
      case 'medical': return '🏥';
      default: return '⚠️';
    }
  };

  const handleAcceptRequest = async () => {
    setIsLoading(true);
    setIsLoading(false);
  };

  const handleRejectRequest = async () => {
  };

  if (!request) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading emergency request...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-4">
              <Button variant="outline" size="sm" className="mr-4" onAction={() => navigate('/gov')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Emergency Request Review</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Request ID: {request.id}</p>
          </div>

          {/* Status Banner */}
          <div className={`mb-6`}>
            <div className={`p-4 rounded-lg border-2 ${getUrgencyColor(request.urgencyLevel)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getEmergencyIcon(request.emergencyType)}</span>
                  <div>
                    <h2 className="text-lg font-semibold">{request.emergencyType} Emergency</h2>
                    <p className="text-sm opacity-90">Urgency Level: {request.urgencyLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Status: {request.status}</p>
                  <p className="text-xs opacity-75">
                    {new Date(request.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Merged Request Details & Contact Information */}
          <div className="py-2">
            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request & Contact Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Emergency Type</label>
                      <p className="text-gray-900">{request.emergencyType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Urgency Level</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgencyLevel).replace('border-', 'border ')}`}>
                        {request.urgencyLevel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">People Count</label>
                    <div className="flex items-center mt-1">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{request.peopleCount} people affected</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Situation Description</label>
                    <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                      {request.situation}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Submitted By</label>
                      <p className="text-gray-900">{request.submittedBy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Number</label>
                      <p className="text-gray-900">{request.contactInfo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Image Evidence */}
          {request.image && (
            <div className="py-2">
              <Card>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <Camera className="w-5 h-5 inline mr-2" />
                    Submitted Evidence
                  </h3>
                  <div className="relative">
                    <img
                      src={request.image}
                      alt="Emergency evidence"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowFullImage(true)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90"
                      onAction={() => setShowFullImage(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Full
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Location Map */}
          <div className="py-2">
            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Emergency Location
                </h3>
                <div className="h-64 sm:h-80 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[request.latitude, request.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[request.latitude, request.longitude]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); animation: pulse 2s infinite;"></div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    >
                      <Popup>
                        <div className="text-sm">
                          <h4 className="font-semibold text-red-600">{request.emergencyType} Emergency</h4>
                          <p>Urgency: {request.urgencyLevel}</p>
                          <p>People Affected: {request.peopleCount}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <p>Coordinates: {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Insights Markdown */}
          <div className="py-2">
            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                  <ReactMarkdown>
                    {`**AI Analysis:**

- This section will provide AI-generated insights about the emergency request, such as severity estimation, recommended actions, or resource allocation suggestions.
- (Integrate your AI backend to populate this section.)`}
                  </ReactMarkdown>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="py-2">
            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                {request.status === 'Pending' ? (
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onAction={() => setConfirmAction({ open: true, action: 'accept' })}
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept as Disaster
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      onAction={() => setConfirmAction({ open: true, action: 'reject' })}
                      disabled={isLoading}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                      request.status === 'Accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'Accepted' ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-2" />
                      )}
                      Request {request.status}
                    </div>
                  </div>
                )}
                
              </div>
            </Card>
          </div>
        </div>

        {/* Full Image Modal */}
        {showFullImage && request.image && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={request.image}
                alt="Emergency evidence full view"
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="outline"
                className="absolute top-4 right-4 bg-white"
                onAction={() => setShowFullImage(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Notification Dialog */}
        <Transition show={notification.open} as={React.Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setNotification({ ...notification, open: false })}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
              </Transition.Child>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6 ${notification.type === 'success' ? 'border-green-200' : 'border-red-200'} border-t-4`}>
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>{notification.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}</div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        {notification.type === 'success' ? 'Success' : 'Error'}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button variant="primary" size="sm" onAction={() => { setNotification({ ...notification, open: false }); if (notification.type === 'success') navigate('/gov'); }}>OK</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Confirmation Dialog */}
        <Transition show={confirmAction.open} as={React.Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setConfirmAction({ open: false, action: null })}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
              </Transition.Child>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        {confirmAction.action === 'accept' ? 'Accept Emergency Request' : 'Reject Emergency Request'}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {confirmAction.action === 'accept'
                            ? 'Are you sure you want to accept this emergency request and notify response teams?'
                            : 'Are you sure you want to reject this emergency request?'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onAction={async () => {
                        setConfirmAction({ open: false, action: null });
                        if (confirmAction.action === 'accept') await handleAcceptRequest();
                        if (confirmAction.action === 'reject') await handleRejectRequest();
                      }}
                    >
                      {confirmAction.action === 'accept' ? 'Yes, Accept' : 'Yes, Reject'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onAction={() => setConfirmAction({ open: false, action: null })}
                    >
                      Cancel
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
      <Footer />
    </>
  );
};

export default EmergencyRequestReview;