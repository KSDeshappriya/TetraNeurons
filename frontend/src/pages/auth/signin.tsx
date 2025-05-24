import React, { useState } from 'react';
import { Eye, EyeOff, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/auth';
import type { UserLogin } from '../../services/auth';
import { useNavigate } from 'react-router';
import { useLocation } from '../../hooks/useLocation';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<UserLogin>({
    email: '',
    password: '',
    latitude: 0,
    longitude: 0
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { location, loading: locationLoading, error: locationError, getCurrentLocation, clearError } = useLocation();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationClick = () => {
    clearError(); // Clear previous errors
    getCurrentLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!location) {
      setMessage('Please share your location to continue');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude
      };

      const token = await authService.login(submitData);
      if(token != null){
        setMessage('Login successful!');
        const role = authService.getUserRole();
        if (role === 'user') navigate('/user');
        else if (role === 'volunteer') navigate('/volunteer');
        else if (role === 'first_responder') navigate('/first_responder');
        else if (role === 'government') navigate('/government');
        else navigate('/public');
      }
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      setMessage(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign In</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
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

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <button
              type="button"
              onClick={handleLocationClick}
              disabled={locationLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 ${
                locationError 
                  ? 'border-red-500 bg-red-50' 
                  : location 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300'
              }`}
            >
              {locationLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Getting location...
                </>
              ) : locationError ? (
                <>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-600">Try again</span>
                </>
              ) : location ? (
                <>
                  <MapPin size={16} className="text-green-500" />
                  <span className="text-green-600">Location obtained</span>
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  Get current location
                </>
              )}
            </button>
            
            {locationError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">Location Error</p>
                    <p className="text-red-600 text-sm mt-1">{locationError}</p>
                    {locationError.includes('denied') && (
                      <p className="text-red-600 text-xs mt-2">
                        💡 Tip: Look for a location icon in your browser's address bar and click "Allow"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {location && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">
                  📍 Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !location}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {message && (
            <p className={`text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignIn;