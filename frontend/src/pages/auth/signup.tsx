import React, { useState } from 'react';
import { MapPin, Eye, EyeOff, Shield, AlertTriangle, Building2, Heart, Users } from 'lucide-react';
import { authService} from '../../services/auth';
import type { UserSignup } from '../../services/auth';
import { useLocation } from '../../hooks/useLocation';
import { useNavigate,Link } from 'react-router';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<UserSignup>({
    name: '',
    email: '',
    phone: '',
    latitude: 0,
    longitude: 0,
    password: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationClick = () => {
    getCurrentLocation();
  };

  const userTypes = [
    { 
      value: 'first_responder', 
      label: 'First Responder', 
      icon: AlertTriangle, 
      description: 'Emergency professionals who provide immediate assistance at disaster sites.',
      color: 'red'
    },
    { 
      value: 'volunteer', 
      label: 'Volunteer', 
      icon: Heart, 
      description: 'Individuals who assist with various tasks during disaster response operations.',
      color: 'pink'
    },
    { 
      value: 'user', 
      label: 'Affected Individual', 
      icon: Users, 
      description: 'People directly impacted by the disaster seeking assistance.',
      color: 'blue'
    },
    { 
      value: 'government', 
      label: 'Government Help Centre', 
      icon: Building2, 
      description: 'Official government representatives coordinating disaster response.',
      color: 'green'
    }
  ];

  const getSelectedRoleInfo = () => {
    return userTypes.find(type => type.value === formData.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submitData = {
        ...formData,
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
      };

      if (formData.role === 'volunteer' && skills) {
        submitData.skills = skills.split(',').map(s => s.trim());
      }

      const result = await authService.signup(submitData);
      if (result != null) {
        setMessage('Account created successfully!');
        setTimeout(() => {
          navigate('/auth/signin');
        }, 1000);
      }
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      setMessage(err.response?.data?.detail || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'volunteer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., First Aid, CPR, Search & Rescue"
              />
            </div>
          </div>
        );
      case 'first_responder':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit"
              />
            </div>
          </div>
        );
      case 'government':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Position"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getRoleColorClasses = (color: string) => {
    const colorMap = {
      red: 'bg-red-50 border-red-200 text-red-800',
      pink: 'bg-pink-50 border-pink-200 text-pink-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getRoleIconColor = (color: string) => {
    const iconColorMap = {
      red: 'text-red-600',
      pink: 'text-pink-600',
      blue: 'text-blue-600',
      green: 'text-green-600'
    };
    return iconColorMap[color as keyof typeof iconColorMap] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join TetraNeurons Disaster Response</p>
        </div>

        <Card className="p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {userTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            {/* Role Description */}
            {(() => {
              const selectedRole = getSelectedRoleInfo();
              if (selectedRole) {
                const IconComponent = selectedRole.icon;
                return (
                  <div className={`flex items-start space-x-3 p-3 mt-3 rounded-lg border ${getRoleColorClasses(selectedRole.color)}`}>
                    <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getRoleIconColor(selectedRole.color)}`} />
                    <div className="text-sm">
                      <p className="font-medium">{selectedRole.label}</p>
                      <p className="mt-1 opacity-90">{selectedRole.description}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {renderRoleSpecificFields()}

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <button
              type="button"
              onClick={handleLocationClick}
              disabled={locationLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              <MapPin size={16} />
              {locationLoading ? 'Getting location...' : location ? 'Location obtained' : 'Get current location'}
            </button>
            {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
            {location && (
              <p className="text-green-500 text-sm mt-1">
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !location}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          
          {message && (
            <p className={`text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

           {/* Already have an account link */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/auth/signin" className="font-medium text-primary-600 hover:text-primary-700">Sign In</Link>
          </p>
        </div>

        </form>
     </Card>
        {/* Footer */}
   <Footer />
      </div>
    </div>
  );
};

export default SignUp;