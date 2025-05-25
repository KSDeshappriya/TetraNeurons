import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, Phone, Mail, Building, Users, Award, Briefcase } from 'lucide-react';
import { authService, type UserProfile } from '../services/auth';
import NavigationBar from '../components/layout/Navigationbar';
import Footer from '../components/layout/Footer';


const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await authService.getUserProfile();
      setProfile(profileData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () =>  {
    await authService.logout();
    window.location.reload();
  };

  const generateAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRoleSpecificInfo = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'volunteer':
        return (
          <div className="space-y-4">
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 mt-1 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {profile.status && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <p className="text-gray-600 capitalize">{profile.status}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'first_responder':
        return (
          <div className="space-y-4">
            {profile.department && (
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Department</h3>
                  <p className="text-gray-600">{profile.department}</p>
                </div>
              </div>
            )}
            {profile.unit && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Unit</h3>
                  <p className="text-gray-600">{profile.unit}</p>
                </div>
              </div>
            )}
            {profile.status && (
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <p className="text-gray-600 capitalize">{profile.status}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'government':
        return (
          <div className="space-y-4">
            {profile.department && (
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Department</h3>
                  <p className="text-gray-600">{profile.department}</p>
                </div>
              </div>
            )}
            {profile.position && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Position</h3>
                  <p className="text-gray-600">{profile.position}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'user':
      default:
        return (
          <div className="space-y-4">
            {profile.status && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <p className="text-gray-600 capitalize">{profile.status}</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (        
    <div className="min-h-screen bg-white py-8 px-4">
      <NavigationBar  />
      <div className="max-w-2xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="border border-gray-200 rounded-lg p-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              <img
                src={profile.profile_image_url || generateAvatarUrl(profile.name)}
                alt={profile.name}
                className="w-24 h-24 rounded-full border border-gray-200"
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-gray-500 capitalize mb-2">{profile.role.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500">Member since {formatDate(profile.created_at)}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Contact Information
            </h3>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Phone</h4>
                <p className="text-gray-600">{profile.phone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p className="text-gray-600">
                    {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <iframe
                  title="User Location Map"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${profile.longitude-0.005}%2C${profile.latitude-0.005}%2C${profile.longitude+0.005}%2C${profile.latitude+0.005}&layer=mapnik&marker=${profile.latitude}%2C${profile.longitude}`}
                ></iframe>
              </div>
            </div>
          </div>

          {/* Role-specific information */}
          {renderRoleSpecificInfo() && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Role Information
              </h3>
              {renderRoleSpecificInfo()}
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
<Footer />
    </div>
  );
};

export default Profile;