import React, { useState } from 'react';
import { Eye, EyeOff, MapPin, AlertCircle, Shield, Users, Heart, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For UI demonstration only - no actual authentication
    alert('Sign In page - UI demonstration only. Authentication is disabled for UI testing.');
  };

  const userTypes = [
    { value: 'user', label: 'Citizen', icon: Users, description: 'Report emergencies and access resources' },
    { value: 'volunteer', label: 'Volunteer', icon: Heart, description: 'Help during disaster response' },
    { value: 'first_responder', label: 'First Responder', icon: Shield, description: 'Emergency response professional' },
    { value: 'government', label: 'Government Official', icon: Building2, description: 'Coordinate disaster response' }
  ];

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
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                User Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {userTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        formData.userType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={formData.userType === type.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <IconComponent className={`h-5 w-5 mr-3 ${
                          formData.userType === type.value ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className={`text-sm font-medium ${
                            formData.userType === type.value ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            {type.label}
                          </div>
                          <div className={`text-xs ${
                            formData.userType === type.value ? 'text-primary-700' : 'text-gray-500'
                          }`}>
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

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

            {/* Location Notice */}
            <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Location Access Required</p>
                <p className="text-blue-700">We'll need access to your location to provide emergency services in your area.</p>
              </div>
            </div>

            {/* Demo Notice */}
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">UI Demonstration Mode</p>
                <p className="text-yellow-700">This is a UI demonstration. Authentication is disabled for testing purposes.</p>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              fullWidth
              className="bg-primary-600 hover:bg-primary-700"
            >
              Sign In
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link 
                to="#" 
                className="text-sm text-primary-600 hover:text-primary-500"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Forgot Password - UI demonstration only');
                }}
              >
                Forgot your password?
              </Link>
            </div>

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
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            TetraNeurons Disaster Response Coordination System
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
