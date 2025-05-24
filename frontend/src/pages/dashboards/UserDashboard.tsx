import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Cloud, 
  Building,
  Users,
  MapPin,
  Clock,
  Phone,
  Camera,
  ExternalLink,
  X,
  CheckCircle2,
  Package,
  Heart,
  PhoneCall,
  Bus,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoFrameGrid from '../../components/VideoFrameGrid';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import StatCard from '../../components/ui/StatCard';
import { sendEmergencyReport } from '../../services/emergency';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

function Switch({ checked, onChange, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      aria-label={checked ? "Deactivate emergency mode" : "Activate emergency mode"}
      onClick={() => onChange(!checked)}
      className={`${className} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emergency-500 focus:ring-offset-2`}
    >
      <span
        className={`${
          checked ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
        } inline-block h-4 w-4 transform rounded-full transition-transform`}
      />
    </button>
  );
}

interface EmergencyType {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface UrgencyLevel {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface Disaster {
  id: number;
  type: string;
  location: string;
  urgency: string;
  peopleAffected: number;
  timeReported: string;
  status: string;
}

type UrgencyType = 'Critical' | 'High Priority' | 'Medium Priority' | 'Low Priority';
type StatusType = 'Active' | 'Responding' | 'Contained';

const UserDashboard: React.FC = () => {
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [emergencyType, setEmergencyType] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('');
  const [situation, setSituation] = useState<string>('');
  const [peopleCount, setPeopleCount] = useState<string>('');
  const [showVideoGrid, setShowVideoGrid] = useState(false);
  const [videoGridKey, setVideoGridKey] = useState(0);
  const [videoGridRecording, setVideoGridRecording] = useState(false);
  const [videoGridImage, setVideoGridImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const emergencyTypes: EmergencyType[] = [
    { id: 'flood', name: 'Flood', icon: Cloud },
    { id: 'earthquake', name: 'Earthquake', icon: Building },
    { id: 'fire', name: 'Fire', icon: Flame },
    { id: 'landslide', name: 'Landslide', icon: AlertTriangle },
    { id: 'storm', name: 'Storm', icon: Cloud },
    { id: 'other', name: 'Other', icon: AlertTriangle }
  ];

  const urgencyLevels: UrgencyLevel[] = [
    { id: 'low', name: 'Low Priority', description: 'Minor incident, no immediate danger', color: 'success' },
    { id: 'medium', name: 'Medium Priority', description: 'Moderate risk, assistance needed', color: 'warning' },
    { id: 'high', name: 'High Priority', description: 'Serious situation, urgent response required', color: 'warning' },
    { id: 'critical', name: 'Critical', description: 'Life-threatening emergency, immediate help needed', color: 'emergency' }
  ];

  // Mock data for nearby disasters
  const nearbyDisasters: Disaster[] = [
    {
      id: 1,
      type: 'Flooding',
      location: 'Downtown River District',
      urgency: 'Critical',
      peopleAffected: 120,
      timeReported: '10 minutes ago',
      status: 'Active'
    },
    {
      id: 2,
      type: 'Building Collapse',
      location: 'Westside Commercial Zone',
      urgency: 'High Priority',
      peopleAffected: 15,
      timeReported: '45 minutes ago',
      status: 'Responding'
    }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!emergencyActive) {
      setAlertMessage('Please activate emergency switch to report');
      setAlertOpen(true);
      return;
    }
    if (!emergencyType || !urgencyLevel || !situation || !peopleCount) {
      setAlertMessage('Please fill in all required fields');
      setAlertOpen(true);
      return;
    }
    if (!userLocation) {
      setAlertMessage('Location is required. Please get your location.');
      setAlertOpen(true);
      return;
    }
    setSubmitting(true);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('emergencyType', emergencyType);
      formData.append('urgencyLevel', urgencyLevel);
      formData.append('situation', situation);
      formData.append('peopleCount', peopleCount);
      if (videoGridImage) {
        // Convert base64 to blob
        const blob = await (await fetch(videoGridImage)).blob();
        formData.append('image', blob, 'emergency.jpg');
      }
      // Use the service for API call
      await sendEmergencyReport(formData);
      
      setSubmitSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setEmergencyActive(false);
        setEmergencyType('');
        setUrgencyLevel('');
        setSituation('');
        setPeopleCount('');
        setVideoGridImage(null);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting emergency report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSituationChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setSituation(e.target.value);
  };

  const handlePeopleCountChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setPeopleCount(e.target.value);
  };

  const getUrgencyStyles = (urgency: string): string => {
    switch (urgency as UrgencyType) {
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

  const getStatusStyles = (status: string): string => {
    switch (status as StatusType) {
      case 'Active':
        return 'bg-emergency-100 text-emergency-700';
      case 'Responding':
        return 'bg-primary-100 text-primary-700';
      case 'Contained':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEmergencyTypeSelect = (typeId: string): void => {
    setEmergencyType(typeId);
  };

  const handleUrgencyLevelSelect = (levelId: string): void => {
    setUrgencyLevel(levelId);
  };

  const handleRecordVideoGrid = () => {
    setShowVideoGrid(true);
    setVideoGridKey(prev => prev + 1); // force remount for fresh recording
    setVideoGridRecording(true);
  };
  
  const handleCloseVideoGrid = () => {
    setShowVideoGrid(false);
    setVideoGridRecording(false);
  };

  const handleImageReady = (imageDataUrl: string) => {
    setVideoGridImage(imageDataUrl); // Store the image for form submission
    setShowVideoGrid(false);
    setVideoGridRecording(false);
  };

  const peopleOptions = [
    { value: "", label: "Select number of people" },
    { value: "1", label: "1 person" },
    { value: "2-5", label: "2-5 people" },
    { value: "6-10", label: "6-10 people" },
    { value: "11-25", label: "11-25 people" },
    { value: "26-50", label: "26-50 people" },
    { value: "50+", label: "More than 50 people" },
    { value: "unknown", label: "Unknown" },
  ];
  const handleGetLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocationError('Unable to retrieve your location.');
      }
    );
  };

  // Alert modal component
  function AlertModal({ open, onClose, message }: { open: boolean; onClose: () => void; message: string }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
          <div className="text-lg font-semibold mb-4">Alert</div>
          <div className="mb-4 text-gray-800">{message}</div>
          <button onClick={onClose} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">OK</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            User Dashboard
          </h1>
          <p className="text-gray-600">
            Report emergencies and view nearby incidents
          </p>
        </div>
</div></div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">          <StatCard 
            title="Active Emergencies"
            value="3"
            icon={AlertTriangle}
            change={{ value: 1, isPositive: true }}
            variant="emergency"
            footer="since yesterday"
          />
          <StatCard 
            title="Available Shelters"
            value="12"
            icon={Building}
            footer="75% occupancy rate"
            variant="info"
          />
          <StatCard 
            title="Resource Centers"
            value="8"
            icon={Users}
            change={{ value: 4, isPositive: true }}
            variant="success"
            footer="currently open"
          />
        </div>        {submitSuccess && (
          <Alert 
            variant="success" 
            title="Emergency Report Submitted"
            className="mb-6"
          >
            Your report has been successfully submitted. Help is on the way.
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Emergency Report Form */}
            <Card
              title="Report Emergency"
              subtitle="Use this form to report an emergency situation"
              className="mb-6"
            >
              <div className="space-y-6">
                {/* Emergency Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Emergency Mode
                    </h3>
                    <p className="text-sm text-gray-600">
                      Activate to report an emergency situation
                    </p>
                  </div>
                  <Switch
                    checked={emergencyActive}
                    onChange={setEmergencyActive}
                    className={emergencyActive ? 'bg-emergency-600' : 'bg-gray-300'}
                  />
                </div>

                {emergencyActive && (
                  <>
                    {/* Emergency Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type of Emergency *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {emergencyTypes.map((type) => {
                          const IconComponent = type.icon || Info;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              aria-label={`Select ${type.name} emergency type`}
                              onClick={() => handleEmergencyTypeSelect(type.id)}
                              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                                emergencyType === type.id
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <IconComponent className="h-6 w-6 mx-auto mb-2" />
                              <span className="text-sm font-medium">{type.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Urgency Level *
                      </label>
                      <div className="space-y-2">
                        {urgencyLevels.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            aria-label={`Select ${level.name} urgency level`}
                            onClick={() => handleUrgencyLevelSelect(level.id)}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                              urgencyLevel === level.id
                                ? `border-${level.color}-500 bg-${level.color}-50`
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{level.name}</div>
                            <div className="text-sm text-gray-600">{level.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Situation Description */}
                    <div>
                      <Textarea
                        label="Describe the Situation *"
                        value={situation}
                        onChange={handleSituationChange}
                        placeholder="Please provide details about the emergency situation..."
                        rows={4}
                      />
                    </div>
                    {/* Number of People */}
                    <div>
                      <Select
                        label="How many people need assistance? *"
                        value={peopleCount}
                        onChange={handlePeopleCountChange}
                        options={peopleOptions}
                      />
                    </div>
        
                 {/* User Location Button (Required, Map Marker Icon, Red Star) */}
                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Your Location <span className="text-red-600">*</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" /></svg>
                    </label>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2 border border-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" /></svg>
                        Get My Location
                      </button>
                      {userLocation && (
                        <span className="text-black text-sm">Lat: {userLocation.latitude.toFixed(5)}, Lng: {userLocation.longitude.toFixed(5)}</span>
                      )}
                      {locationError && (
                        <span className="text-red-600 text-sm">{locationError}</span>
                      )}
                    </div>
                  </div>


                    {/* Video Record */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Evidence (Optional)
                      </label>
                      <div className="flex gap-2 items-center">
                        {!videoGridRecording && (
                          <Button
                            variant="secondary"
                            onClick={handleRecordVideoGrid}
                            leftIcon={<Camera />}
                          >
                            Start 9s Recording
                          </Button>
                        )}
                      </div>
                      {showVideoGrid && (
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <VideoFrameGrid key={videoGridKey} onImageReady={handleImageReady} onClose={handleCloseVideoGrid} />
                        </div>
                      )}
                      {videoGridImage && (
                        <div className="mt-2">
                          <div className="relative border rounded-lg overflow-hidden max-w-xs">
                            <img src={videoGridImage} alt="Frame Grid Preview" className="w-full" />
                            <button 
                              onClick={() => setVideoGridImage(null)}
                              aria-label="Remove image"
                              className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-success-700 text-sm font-medium mt-1 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Image attached for submission
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      variant="emergency"
                      fullWidth
                      isLoading={submitting}
                      onClick={handleSubmit}
                    >
                      Submit Emergency Report
                    </Button>
                  </>
                )}
              </div>
            </Card>
            
            {/* Emergency Resources */}
            <Card 
              title="Emergency Resources"
              subtitle="Access important resources during emergencies"
              className="mb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link 
                  to="/user/resources/shelters"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Building className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Nearby Shelters</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">Find safe locations near you</p>
                </Link>
                
                <Link 
                  to="/user/resources/supplies"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Emergency Supplies</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">Request essential items</p>
                </Link>
                
                <Link 
                  to="/user/resources/medical"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Medical Assistance</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">Find medical help</p>
                </Link>
                
                <Link 
                  to="/user/resources/contacts"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PhoneCall className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Emergency Contacts</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">Important numbers</p>
                </Link>
                
                <Link 
                  to="/user/resources/transportation"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Bus className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Transportation</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">Evacuation routes & services</p>
                </Link>
                
                <Link 
                  to="/user/resources/guides"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Safety Guides</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">How to stay safe</p>
                </Link>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            {/* Nearby Disasters */}
            <Card
              title="Nearby Disasters"
              subtitle="Current emergency situations in your area"
              className="mb-6"
              headerAction={
                <Link
                  to="/user/reports"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              }
            >
              <div className="space-y-4">
                {nearbyDisasters.map((disaster) => (
                  <div
                    key={disaster.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {disaster.type}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(
                                disaster.status
                              )}`}
                            >
                              {disaster.status}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="text-sm">{disaster.location}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{disaster.peopleAffected} people affected</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{disaster.timeReported}</span>
                            </div>
                          </div>
                        </div>
                        
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyStyles(
                            disaster.urgency
                          )}`}
                        >
                          {disaster.urgency}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<ExternalLink />}
                        >
                          View Details
                        </Button>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Phone />}
                        >
                          Contact Help
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {nearbyDisasters.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No nearby disasters reported</p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Safety Tips */}
            <Card
              title="Safety Tips"
              subtitle="Quick guidelines for emergency situations"
            >
              <div className="space-y-3">
                <div className="p-3 bg-warning-50 border-l-4 border-warning-500 rounded-r-lg">
                  <h4 className="font-medium text-warning-800">During Flooding</h4>
                  <p className="text-sm text-warning-700 mt-1">Move to higher ground and avoid walking through flowing water.</p>
                </div>
                
                <div className="p-3 bg-emergency-50 border-l-4 border-emergency-500 rounded-r-lg">
                  <h4 className="font-medium text-emergency-800">During Fire</h4>
                  <p className="text-sm text-emergency-700 mt-1">Stay low to the ground, cover your mouth, and follow evacuation routes.</p>
                </div>
                
                <div className="p-3 bg-primary-50 border-l-4 border-primary-500 rounded-r-lg">
                  <h4 className="font-medium text-primary-800">During Earthquake</h4>
                  <p className="text-sm text-primary-700 mt-1">Drop, cover, and hold on. Stay away from windows and exterior walls.</p>
                </div>
                
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-2"
                  leftIcon={<BookOpen />}
                >
                  View All Safety Tips
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} message={alertMessage} />
    </div>
  );
};

export default UserDashboard;
