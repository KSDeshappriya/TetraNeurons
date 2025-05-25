import React, { useState } from 'react';
import { Eye, EyeOff, MapPin, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { authService } from '../../services/auth';
import type { UserLogin } from '../../services/auth';
import { useLocation } from '../../hooks/useLocation';
import Footer from '../../components/layout/Footer';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (token != null) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to TetraNeurons Disaster Response</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">


            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <button
                type="button"
                onClick={handleLocationClick}
                disabled={locationLoading}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 ${locationError
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

              {locationError ? (
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
              ) : (
                // Location Notice
                <div className="flex items-start space-x-2 p-3 mt-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Location Access Required</p>
                    <p className="text-blue-700">We'll need access to your location to provide emergency services in your area.</p>
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

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading || !location}
              fullWidth
              className="bg-primary-600 hover:bg-primary-700"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            {message && (
              <p className={`text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </Link>
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

export default SignIn;
