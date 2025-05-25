import React, { useState } from 'react';
import { Save, X, MapPin, Clock, Phone, Users, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import NavigationBar from '../../components/layout/Navigationbar';
import Footer from '../../components/layout/Footer';

interface ResourceItem {
  id: string;
  type: 'shelter' | 'supply' | 'medical';
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  distance: number;
  status: 'open' | 'closed' | 'limited';
  hours: string;
  contact?: string;
  capacity?: { total: number; available: number; };
}

interface FormData {
  type: 'shelter' | 'supply' | 'medical';
  name: string;
  description: string;
  longitude: string;
  latitude: string;
  status: 'open' | 'closed' | 'limited';
  hours: string;
  contact: string;
  totalCapacity: string;
}

const ResourceAddingPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    type: 'shelter',
    name: '',
    description: '',
    longitude: '',
    latitude: '',
    status: 'open',
    hours: '',
    contact: '',
    totalCapacity: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resourceTypes = [
    { value: 'shelter', label: 'Shelter', icon: '🏠', description: 'Emergency housing and accommodation' },
    { value: 'supply', label: 'Supply', icon: '📦', description: 'Food, water, and essential supplies' },
    { value: 'medical', label: 'Medical', icon: '🏥', description: 'Medical facilities and healthcare' },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Resource name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.longitude.trim()) newErrors.longitude = 'Longitude is required';
    else if (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
      newErrors.longitude = 'Valid longitude (-180 to 180) is required';
    }
    if (!formData.latitude.trim()) newErrors.latitude = 'Latitude is required';
    else if (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
      newErrors.latitude = 'Valid latitude (-90 to 90) is required';
    }
    if (!formData.hours.trim()) newErrors.hours = 'Operating hours are required';

    // Capacity validation (optional but if provided, must be valid)
    if (formData.totalCapacity && isNaN(Number(formData.totalCapacity))) {
      newErrors.totalCapacity = 'Capacity must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Create resource object
      const newResource: ResourceItem = {
        id: `RES-${Date.now()}`, // Generate unique ID
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description.trim(),
        longitude: Number(formData.longitude),
        latitude: Number(formData.latitude),
        distance: 0, // Will be calculated based on user location
        status: formData.status,
        hours: formData.hours.trim(),
        contact: formData.contact.trim() || undefined,
        capacity: formData.totalCapacity ? {
          total: Number(formData.totalCapacity),
          available: Number(formData.totalCapacity) // Available equals total capacity
        } : undefined
      };

      // Here you would typically send the data to your API
      console.log('New Resource:', newResource);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Resource added successfully!');
      
      // Reset form
      setFormData({
        type: 'shelter',
        name: '',
        description: '',
        longitude: '',
        latitude: '',
        status: 'open',
        hours: '',
        contact: '',
        totalCapacity: ''
      });
      
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back or reset form
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      setFormData({
        type: 'shelter',
        name: '',
        description: '',
        longitude: '',
        latitude: '',
        status: 'open',
        hours: '',
        contact: '',
        totalCapacity: ''
      });
      setErrors({});
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Resource</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Register a new emergency resource for disaster response</p>
          </div>

          {/* Resource Type Selection */}
          <Card>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resource Type</h2>
              <div className="grid grid-cols-3 gap-4">
                {resourceTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500 text-center mt-1">{type.description}</div>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="mt-6">
              {/* Combined Form Information */}
              <Card>
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Resource Information</h2>
                  
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 col-span-1">
                            Resource Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={` w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Downtown Emergency Shelter"
                          />
                          {errors.name && (
                            <p className="text-red-600 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                       

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Describe the resource, services provided, and any special notes..."
                          />
                          {errors.description && (
                            <p className="text-red-600 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Location Information
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Latitude *
                          </label>
                          <input
                            type="text"
                            value={formData.latitude}
                            onChange={(e) => handleInputChange('latitude', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.latitude ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 37.7749"
                          />
                          {errors.latitude && (
                            <p className="text-red-600 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.latitude}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longitude *
                          </label>
                          <input
                            type="text"
                            value={formData.longitude}
                            onChange={(e) => handleInputChange('longitude', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.longitude ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., -122.4194"
                          />
                          {errors.longitude && (
                            <p className="text-red-600 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: You can use online tools or GPS coordinates to find the exact latitude and longitude.
                      </p>
                    </div>

                    {/* Contact & Operational Information */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4">Contact & Operational Details</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Operating Hours *
                          </label>
                          <input
                            type="text"
                            value={formData.hours}
                            onChange={(e) => handleInputChange('hours', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 24/7, 9:00 AM - 5:00 PM, Mon-Fri 8-6"
                          />
                          {errors.hours && (
                            <p className="text-red-600 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.hours}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Contact Information
                          </label>
                          <input
                            type="text"
                            value={formData.contact}
                            onChange={(e) => handleInputChange('contact', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Phone number, email, or contact person"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Capacity Information */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Capacity Information
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">Optional: Add capacity information if applicable to this resource type.</p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Capacity
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.totalCapacity}
                            onChange={(e) => handleInputChange('totalCapacity', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.totalCapacity ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 100"
                          />
                          {errors.totalCapacity && (
                            <p className="text-red-600 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.totalCapacity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding Resource...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Add Resource
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResourceAddingPage;