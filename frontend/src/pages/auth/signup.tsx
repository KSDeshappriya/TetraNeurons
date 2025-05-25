import React, { useState } from 'react';
import { 
  Eye, EyeOff, Users, Heart, Building2, AlertCircle, 
  ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Check, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';

const SignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // Form validation errors
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For UI demonstration only - no actual registration
    alert('Sign Up page - UI demonstration only. Registration is disabled for UI testing.');
  };
    const validateStep = (step: number): boolean => {
    let valid = true;
    const newErrors: any = {};
    
    if (step === 1) {
      if (!formData.role) {
        // We don't show an error message for role selection
        // We just disable the Continue button
        valid = false;
      }
    } else if (step === 2) {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
        valid = false;
      }
      
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
        valid = false;
      }
      
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
        valid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        valid = false;
      }
      
      // Phone validation is optional but if provided, validate format
      if (formData.phone && !/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
        valid = false;
      }
    } else if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
        valid = false;
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
        valid = false;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        valid = false;
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        valid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        valid = false;
      }
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  const userTypes = [
    { 
      value: 'first_responder', 
      label: 'First Responder', 
      icon: AlertTriangle, 
      description: 'Emergency professionals who provide immediate assistance at disaster sites.'
    },
    { 
      value: 'volunteer', 
      label: 'Volunteer', 
      icon: Heart, 
      description: 'Individuals who assist with various tasks during disaster response operations.'
    },
    { 
      value: 'user', 
      label: 'Affected Individual', 
      icon: Users, 
      description: 'People directly impacted by the disaster seeking assistance.'
    },
    { 
      value: 'government', 
      label: 'Government Help Centre', 
      icon: Building2, 
      description: 'Official government representatives coordinating disaster response.'
    }
  ];
  // Render the progress indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center relative z-10 shadow-sm
                  transition-colors duration-200
                  ${step < currentStep ? 'bg-green-500 text-white' : 
                    step === currentStep ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 
                    'bg-gray-200 text-gray-500'}
                `}
              >
                {step < currentStep ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span className="font-medium">{step}</span>
                )}
              </div>
              <div className={`text-xs mt-2 text-center font-medium ${
                step === currentStep ? 'text-primary-700' : 'text-gray-500'
              }`}>
                {step === 1 && "Choose Role"}
                {step === 2 && "Personal Information"}
                {step === 3 && "Account Setup"}
                {step === 4 && "Review & Submit"}
              </div>
            </div>
            
            {/* Connecting line (except after last step) */}
            {step < 4 && (
              <div 
                className={`flex-1 h-[3px] mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };  // Step 1: Role Selection
  const renderRoleSelection = () => {
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Select Your Role</h2>
        <p className="mb-6 text-gray-600 text-sm">
          Choose the role that best describes your involvement in disaster response operations.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = formData.role === type.value;
            
            return (
              <div 
                key={type.value}
                className={`
                  border rounded-lg cursor-pointer overflow-hidden relative transition-all duration-200
                  ${isSelected ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                `}
              >
                <input
                  type="radio"
                  name="role"
                  id={`role-${type.value}`}
                  value={type.value}
                  checked={isSelected}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <label 
                  htmlFor={`role-${type.value}`}
                  className={`block p-4 h-full ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col h-full">
                    <div className={`mb-3 p-2 inline-flex rounded-full ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      <IconComponent 
                        className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{type.label}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </label>
              </div>
            );
          })}
        </div>
        
        {/* Role selection guidance */}
        {!formData.role && (
          <div className="flex items-center mt-6 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Please select a role to continue with your registration.
            </p>
          </div>
        )}
      </>
    );
  };

  // Step 2: Personal Information
  const renderPersonalInfo = () => {
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Personal Information</h2>
        <p className="mb-6 text-gray-600 text-sm">
          Please provide your personal details. This information will be used to identify you in the system.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`
                    block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`
                    block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    ${errors.lastName ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7L12 14L2 7" />
                  </svg>
                </div>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`
                  block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}
                `}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
            {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1 (555) 123-4567"
                className={`
                  block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  ${errors.phone ? 'border-red-500' : 'border-gray-300'}
                `}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Enter a valid phone number with country code, e.g., +1 (555) 123-4567</p>
          </div>
        </div>
      </>
    );
  };
  // Step 3: Account Setup (Password)
  const renderAccountSetup = () => {
    // Function to check password strength
    const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong', message: string } => {
      if (!password) {
        return { strength: 'weak', message: 'Password is required' };
      }
      if (password.length < 8) {
        return { strength: 'weak', message: 'Password is too short' };
      }
      
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
      
      const passedChecks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
      
      if (passedChecks <= 2) {
        return { strength: 'weak', message: 'Weak password' };
      } else if (passedChecks === 3) {
        return { strength: 'medium', message: 'Medium strength password' };
      } else {
        return { strength: 'strong', message: 'Strong password' };
      }
    };
    
    const passwordStrength = getPasswordStrength(formData.password);
    
    const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
      switch (strength) {
        case 'weak': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'strong': return 'bg-green-500';
        default: return 'bg-gray-300';
      }
    };

    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Account Setup</h2>
        <p className="mb-6 text-gray-600 text-sm">
          Create a secure password for your account. We recommend using a strong password with a mix of letters, numbers, and special characters.
        </p>
        
        <div className="space-y-5">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Must be at least 8 characters long"
                className={`
                  block w-full pl-10 pr-10 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  ${errors.password ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ 
                    color: passwordStrength.strength === 'weak' ? '#ef4444' : 
                           passwordStrength.strength === 'medium' ? '#eab308' : '#22c55e' 
                  }}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor(passwordStrength.strength)} transition-all duration-300`} 
                    style={{ 
                      width: passwordStrength.strength === 'weak' ? '33%' : 
                             passwordStrength.strength === 'medium' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
                
                <ul className="mt-2 grid grid-cols-1 gap-1">
                  <li className={`text-xs flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`mr-1.5 w-3 h-3 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {formData.password.length >= 8 && <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                    </div>
                    At least 8 characters long
                  </li>
                  <li className={`text-xs flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`mr-1.5 w-3 h-3 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {/[A-Z]/.test(formData.password) && <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                    </div>
                    Contains uppercase letter
                  </li>
                  <li className={`text-xs flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`mr-1.5 w-3 h-3 rounded-full flex items-center justify-center ${/[a-z]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {/[a-z]/.test(formData.password) && <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                    </div>
                    Contains lowercase letter
                  </li>
                  <li className={`text-xs flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`mr-1.5 w-3 h-3 rounded-full flex items-center justify-center ${/\d/.test(formData.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {/\d/.test(formData.password) && <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                    </div>
                    Contains number
                  </li>
                </ul>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                className={`
                  block w-full pl-10 pr-10 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="flex items-center mt-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Passwords match</span>
              </div>
            )}
            
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          
          {/* Password security note */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mt-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-blue-700">
                  Your password should be at least 8 characters long and include uppercase letters, lowercase letters, 
                  numbers, and special characters for maximum security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  // Step 4: Review & Submit
  const renderReview = () => {
    // Get the current role label
    const selectedRoleType = userTypes.find(type => type.value === formData.role);
    const roleIcon = selectedRoleType?.icon || Users;
    
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Review & Submit</h2>
        <p className="mb-6 text-gray-600 text-sm">
          Please review your information before submitting your registration.
        </p>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
          <div className="bg-primary-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-primary-700">Registration Summary</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Role Information */}
            <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="mr-3 bg-primary-100 p-2 rounded-full">
                {React.createElement(roleIcon, { className: "h-5 w-5 text-primary-600" })}
              </div>
              <div>
                <div className="text-xs text-gray-500">Selected Role</div>
                <div className="font-medium text-gray-900">{selectedRoleType?.label || ''}</div>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
              <div className="px-4 py-2 bg-gray-100">
                <h4 className="text-xs font-medium text-gray-700">Personal Information</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Full Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email Address:</span>
                  <span className="text-sm font-medium text-gray-900">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone Number:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-start space-x-2">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="block text-sm text-gray-700">
              I agree to the <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Privacy Policy</a>. I understand that my personal information will be processed as described in the Privacy Policy.
            </label>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Ready to submit!</h3>
              <p className="mt-2 text-sm text-blue-700">
                Once you've reviewed your information and agreed to the terms, click "Complete Registration" to create your account.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };
  // Navigation buttons
  const renderNavButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {/* Back button */}
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center transition-colors duration-150"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center transition-colors duration-150"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            Back
          </button>
        )}
        
        {/* Continue or Complete button */}
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={currentStep === 1 && !formData.role}
            className={`
              px-5 py-2.5 rounded-md shadow-sm text-sm font-medium text-white flex items-center transition-all duration-150
              ${currentStep === 1 && !formData.role 
                ? 'bg-primary-300 cursor-not-allowed opacity-70' 
                : 'bg-primary-600 hover:bg-primary-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }
            `}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </button>
        ) : (
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center transition-all duration-150"
          >
            Complete Registration
            <Check className="h-4 w-4 ml-1.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header with back button */}
        <div className="mb-6">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-gray-500 hover:text-gray-700 flex items-center mr-4"
              title="Back to home"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          </div>
        </div>

        <Card className="p-8">
          {/* Steps indicator */}
          {renderStepIndicator()}
            <form onSubmit={e => e.preventDefault()} className="mt-6">
            {/* Step content */}
            {currentStep === 1 && renderRoleSelection()}
            {currentStep === 2 && renderPersonalInfo()}
            {currentStep === 3 && renderAccountSetup()}
            {currentStep === 4 && renderReview()}
            
            {/* Navigation buttons */}
            {renderNavButtons()}

            {/* Demo Notice - always visible */}
            {currentStep !== 4 && (
              <div className="flex items-start space-x-2 p-3 mt-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">UI Demonstration Mode</p>
                  <p className="text-yellow-700">This is a UI demonstration. Registration is disabled for testing purposes.</p>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Already have an account link */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/auth/signin" className="font-medium text-primary-600 hover:text-primary-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
