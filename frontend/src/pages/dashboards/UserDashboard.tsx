import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Cloud, 
  Building,
  MapPin, 
  Clock, 
  Users, 
  ExternalLink,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2, // Add this import for loading spinner
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { sendEmergencyReport } from '../../services/emergency';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import NavigationBar from '../../components/layout/Navigationbar';
import Footer from '../../components/layout/Footer';
import { getRecentItemsWithGeohashNotGov } from '../../services/check_disaster';
import geohash from "ngeohash";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

function Switch({ checked, onChange, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`${className} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
}

interface EmergencyType {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface DisasterData {
  uniqueId: string;
  data: {
    ai_processing_time: number;
    citizen_survival_guide: string;
    created_at: number;
    disaster_id: string;
    emergency_type: string;
    geohash: string;
    government_report: string;
    image_url: string;
    latitude: number;
    longitude: number;
    people_count: string;
    situation: string;
    status: string;
    submitted_time: number;
    urgency_level: string;
    user_id: string;
  };
}

const UserDashboard: React.FC = () => {
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [emergencyType, setEmergencyType] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('');
  const [situation, setSituation] = useState<string>('');
  const [peopleCount, setPeopleCount] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [nearbyDisasters, setNearbyDisasters] = useState<DisasterData[]>([]);
  const [userGeohash, setUserGeohash] = useState<string>('');
  
  // Add loading state for submit button
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDisasterData = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          // Encode location to 4-precision geohash
          const geohash4 = geohash.encode(latitude, longitude).substring(0, 4);
          setUserGeohash(geohash4);

          console.log("Using geohash:", geohash4);

          // Fetch data from Firebase
          const data = await getRecentItemsWithGeohashNotGov(geohash4);
          console.log("Fetched disaster data:", data);
          
          // Set the disaster data to state
          if (Array.isArray(data)) {
            setNearbyDisasters(data);
          } else if (data) {
            setNearbyDisasters([data]);
          }
        });
      } catch (error) {
        console.error("Error fetching location or disaster data:", error);
      }
    };

    fetchDisasterData();
  }, []);

  const emergencyTypes: EmergencyType[] = [
    { id: 'flood', name: 'Flood', icon: Cloud },
    { id: 'earthquake', name: 'Earthquake', icon: Building },
    { id: 'fire', name: 'Fire', icon: Flame },
    { id: 'landslide', name: 'Landslide', icon: AlertTriangle },
    { id: 'storm', name: 'Storm', icon: Cloud },
    { id: 'other', name: 'Other', icon: AlertTriangle }
  ];

  const urgencyLevels = [
    { id: 'low', name: 'Low Priority', description: 'Minor incident, no immediate danger' },
    { id: 'medium', name: 'Medium Priority', description: 'Moderate risk, assistance needed' },
    { id: 'high', name: 'High Priority', description: 'Serious situation, urgent response required' },
    { id: 'critical', name: 'Critical', description: 'Life-threatening emergency, immediate help needed' }
  ];

  const calculateDistance = (userGeohash: string, disasterGeohash: string): string => {
    if (!userGeohash || !disasterGeohash) return 'Unknown';
    
    // Decode both geohashes to get coordinates
    const userCoords = geohash.decode(userGeohash);
    const disasterCoords = geohash.decode(disasterGeohash);
    
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = (disasterCoords.latitude - userCoords.latitude) * Math.PI / 180;
    const dLon = (disasterCoords.longitude - userCoords.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userCoords.latitude * Math.PI / 180) * Math.cos(disasterCoords.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
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

    if (!imageFile) {
      setAlertMessage('Image evidence is required. Please upload an image.');
      setAlertOpen(true);
      return;
    }

    // Set loading state to true
    setIsSubmitting(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('emergencyType', emergencyType);
      formData.append('urgencyLevel', urgencyLevel);
      formData.append('situation', situation);
      formData.append('peopleCount', peopleCount);
      formData.append('latitude', String(userLocation.latitude));
      formData.append('longitude', String(userLocation.longitude));
      if (imageFile) {
        formData.append('image', imageFile, imageFile.name);
      }
      
      // Use the service for API call
      await sendEmergencyReport(formData);
      setAlertMessage('Emergency report submitted successfully');
      setAlertOpen(true);
      
      // Reset form
      setEmergencyActive(false);
      setEmergencyType('');
      setUrgencyLevel('');
      setSituation('');
      setPeopleCount('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      setAlertMessage('Failed to submit emergency report. Please try again.');
      setAlertOpen(true);
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }
  };

  const handleSituationChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setSituation(e.target.value);
  };

  const handlePeopleCountChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setPeopleCount(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-emergency-500" />;
      case 'responding':
      case 'processing':
        return <Clock3 className="h-5 w-5 text-primary-500" />;
      case 'resolved':
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'archived':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-emergency-500" />;
    }
  };

  const getEmergencyTypeIcon = (type: string): LucideIcon => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'flood':
        return Cloud;
      case 'earthquake':
        return Building;
      case 'fire':
        return Flame;
      case 'landslide':
        return AlertTriangle;
      case 'storm':
        return Cloud;
      default:
        return AlertTriangle;
    }
  };

  const handleEmergencyTypeSelect = (typeId: string): void => {
    setEmergencyType(typeId);
  };

  const handleUrgencyLevelSelect = (levelId: string): void => {
    setUrgencyLevel(levelId);
  };

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
    <>
    <NavigationBar />
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

        {/* Emergency Report Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Report Emergency
            </h2>

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
                  className={emergencyActive ? 'bg-red-600' : 'bg-gray-300'}
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
                        const IconComponent = type.icon;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleEmergencyTypeSelect(type.id)}
                            disabled={isSubmitting}
                            className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                              emergencyType === type.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          onClick={() => handleUrgencyLevelSelect(level.id)}
                          disabled={isSubmitting}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            urgencyLevel === level.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="font-medium text-gray-900">{level.name}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many people need assistance? *
                    </label>
                    <select
                      value={peopleCount}
                      onChange={handlePeopleCountChange}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select number of people</option>
                      <option value="1">1 person</option>
                      <option value="2-5">2-5 people</option>
                      <option value="6-10">6-10 people</option>
                      <option value="11-25">11-25 people</option>
                      <option value="26-50">26-50 people</option>
                      <option value="50+">More than 50 people</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  {/* Situation Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the Situation *
                    </label>
                    <textarea
                      rows={4}
                      value={situation}
                      onChange={handleSituationChange}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Please provide details about the emergency situation..."
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
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2 border border-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                  {/* Video/Image Evidence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Evidence <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className={`block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img src={imagePreview} alt="Preview" className="border rounded shadow max-w-xs" />
                        <div className="text-green-700 text-sm mt-1">Image attached for submission</div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button with Loading State */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      'Submit Emergency Report'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Disasters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Nearby Disasters
            </h2>

            <div className="space-y-4">
              {nearbyDisasters.length > 0 ? ( 
  nearbyDisasters.map(disaster => {
    if (disaster?.data?.status === 'archived') return null;
                  const EmergencyIcon = getEmergencyTypeIcon(disaster.data.emergency_type);
                  const distance = calculateDistance(userGeohash, disaster.data.geohash);
                  
                  return (
                    <Card key={disaster.uniqueId} className="transition-shadow hover:shadow-md">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-16 flex sm:flex-col items-center justify-center">
                          {getStatusIcon(disaster.data.status)}
                          <span className="mt-2 text-xs font-medium text-gray-500 capitalize">{disaster.data.status}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <EmergencyIcon className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900 capitalize">{disaster.data.emergency_type}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  disaster.data.urgency_level === 'critical' ? 'bg-red-100 text-red-800' :
                                  disaster.data.urgency_level === 'high' ? 'bg-orange-100 text-orange-800' :
                                  disaster.data.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {disaster.data.urgency_level}
                                </span>
                              </div>
                      
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{formatDate(disaster.data.submitted_time)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                             
                              <span className="ml-2  font-medium">({distance} away)</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                              <span>{disaster.data.people_count} people affected</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                              <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<ExternalLink className="h-4 w-4" />}
                              onAction={`/user/report?id=${disaster.uniqueId}`}
                              >
                              View Details
                              </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No nearby disasters reported</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    
    <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} message={alertMessage} />
    </>
  );
};

export default UserDashboard;