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
  Phone
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import VideoFrameGrid from '../../components/VideoFrameGrid';
import { sendEmergencyReport } from '../../services/emergency_service';


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

interface UrgencyLevel {
  id: string;
  name: string;
  description: string;
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

  const emergencyTypes: EmergencyType[] = [
    { id: 'flood', name: 'Flood', icon: Cloud },
    { id: 'earthquake', name: 'Earthquake', icon: Building },
    { id: 'fire', name: 'Fire', icon: Flame },
    { id: 'landslide', name: 'Landslide', icon: AlertTriangle },
    { id: 'storm', name: 'Storm', icon: Cloud },
    { id: 'other', name: 'Other', icon: AlertTriangle }
  ];

  const urgencyLevels: UrgencyLevel[] = [
    { id: 'low', name: 'Low Priority', description: 'Minor incident, no immediate danger' },
    { id: 'medium', name: 'Medium Priority', description: 'Moderate risk, assistance needed' },
    { id: 'high', name: 'High Priority', description: 'Serious situation, urgent response required' },
    { id: 'critical', name: 'Critical', description: 'Life-threatening emergency, immediate help needed' }
  ];

  const nearbyDisasters: Disaster[] = [

  ];

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!emergencyActive) {
      alert('Please activate emergency switch to report');
      return;
    }
    if (!emergencyType || !urgencyLevel || !situation || !peopleCount) {
      alert('Please fill in all required fields');
      return;
    }
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
    alert('Emergency report submitted successfully');
    // Reset form
    setEmergencyActive(false);
    setEmergencyType('');
    setUrgencyLevel('');
    setSituation('');
    setPeopleCount('');
    setVideoGridImage(null);
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High Priority':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium Priority':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low Priority':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStyles = (status: string): string => {
    switch (status as StatusType) {
      case 'Active':
        return 'bg-red-100 text-red-700';
      case 'Responding':
        return 'bg-blue-100 text-blue-700';
      case 'Contained':
        return 'bg-green-100 text-green-700';
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
                            className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                              emergencyType === type.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                          onClick={() => handleUrgencyLevelSelect(level.id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            urgencyLevel === level.id
                              ? 'border-blue-500 bg-blue-50'
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the Situation *
                    </label>
                    <textarea
                      rows={4}
                      value={situation}
                      onChange={handleSituationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Please provide details about the emergency situation..."
                    />
                  </div>

                  {/* Number of People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many people need assistance? *
                    </label>
                    <select
                      value={peopleCount}
                      onChange={handlePeopleCountChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                  {/* Video Record Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Evidence (Optional)
                    </label>
                    <div className="flex gap-2 items-center">
                      {!videoGridRecording && (
                        <button
                          type="button"
                          onClick={handleRecordVideoGrid}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Start 9s Recording
                        </button>
                      )}
                    </div>
                    {showVideoGrid && (
                      <VideoFrameGrid key={videoGridKey} onImageReady={handleImageReady} onClose={handleCloseVideoGrid} />
                    )}
                    {videoGridImage && (
                      <div className="mt-2">
                        <img src={videoGridImage} alt="Frame Grid Preview" className="border rounded shadow max-w-xs" />
                        <div className="text-green-700 text-sm mt-1">Image attached for submission</div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Submit Emergency Report
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
              {nearbyDisasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
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
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{disaster.location}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{disaster.peopleAffected} people affected</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{disaster.timeReported}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyStyles(
                          disaster.urgency
                        )}`}
                      >
                        {disaster.urgency}
                      </span>
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <Phone className="h-4 w-4 mr-1" />
                        Contact Response Team
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {nearbyDisasters.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No nearby disasters reported</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserDashboard;
