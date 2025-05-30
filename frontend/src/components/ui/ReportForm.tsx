import React, { useState, useEffect } from "react";
import { sendRequest } from "../../services/send_request";
import { getDatabase, ref, remove, get } from "firebase/database";
import app from "../../services/firebase";
import { authService } from "../../services/auth";

interface Props {
    disasterId: string;
}

export default function EmergencyReportForm({ disasterId }: Props) {
    const [help, setHelp] = useState("");
    const [urgencyType, setUrgencyType] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [taskId, setTaskId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // New location-related states
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    
    const userId = authService.getTokenPayload()?.uid;

    // Load existing request on component mount
    useEffect(() => {
        const loadExistingRequest = async () => {
            try {
                const db = getDatabase(app);
                const userRequestRef = ref(db, `userrequest/${userId}`);
                const snapshot = await get(userRequestRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setHelp(data.help || "");
                    setUrgencyType(data.urgency_type || "");
                    setLatitude(data.latitude || "");
                    setLongitude(data.longitude || "");
                    setSubmitted(data.status === "submitted");
                    setTaskId(data.task_id || "");
                }
            } catch (error) {
                console.error("Error loading existing request:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadExistingRequest();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const getLocation = () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser. Please enter your location manually.");
            return;
        }

        setLocationLoading(true);
        setLocationError("");

        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds timeout
            maximumAge: 300000 // Accept cached position up to 5 minutes old
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toString());
                setLongitude(position.coords.longitude.toString());
                setLocationLoading(false);
                setLocationError("");
                console.log("Location retrieved successfully:", position.coords);
            },
            (error) => {
                setLocationLoading(false);
                let errorMessage = "";
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied. Please enable location permissions in your browser settings or enter coordinates manually.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable. Please check your GPS/internet connection or enter coordinates manually.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again or enter coordinates manually.";
                        break;
                    default:
                        errorMessage = "An unknown error occurred while retrieving location. Please try again or enter coordinates manually.";
                }
                
                setLocationError(errorMessage);
                console.error("Geolocation error:", error);
            },
            options
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!help.trim() || !urgencyType || !latitude || !longitude) {
            alert("All fields are required. Please fill them out and get your location.");
            return;
        }

        // Validate coordinates
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert("Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)");
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append("disasterId", disasterId);
        formData.append("help", help.trim());
        formData.append("urgencyType", urgencyType);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);

        try {
            const res = await sendRequest(formData);
            if (res.data.status === "received") {
                setSubmitted(true);
                if (res.data.task_id) {
                    setTaskId(res.data.task_id);
                }
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Failed to send report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this emergency request? This action cannot be undone.")) {
            return;
        }

        try {
            const db = getDatabase(app);

            // Remove user request
            const userRequestRef = ref(db, `userrequest/${userId}`);
            await remove(userRequestRef);

            // Remove associated task if exists
            if (taskId) {
                const taskRef = ref(db, `tasks/${disasterId}/${taskId}`);
                await remove(taskRef);
            }

            // Clear form
            setHelp("");
            setUrgencyType("");
            setLatitude("");
            setLongitude("");
            setSubmitted(false);
            setTaskId("");
            setLocationError("");
            
            alert("Request deleted successfully.");
        } catch (error) {
            console.error("Failed to delete request:", error);
            alert("Failed to delete request. Please try again.");
        }
    };

    const clearLocation = () => {
        setLatitude("");
        setLongitude("");
        setLocationError("");
    };

    return (
        <div className="mt-4 max-w-xl mx-auto p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Emergency Request</h2>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Loading...</div>
                </div>
            ) : !submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="help" className="block text-sm font-medium text-gray-700 mb-1">
                            Describe the help you need *
                        </label>
                        <textarea
                            id="help"
                            value={help}
                            onChange={(e) => setHelp(e.target.value)}
                            required
                            placeholder="Please describe your emergency situation and what kind of help you need..."
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                            Urgency Level *
                        </label>
                        <select
                            id="urgency"
                            value={urgencyType}
                            onChange={(e) => setUrgencyType(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Urgency Level</option>
                            <option value="low">Low - Non-urgent assistance needed</option>
                            <option value="medium">Medium - Timely help required</option>
                            <option value="high">High - Immediate emergency assistance</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location *
                        </label>
                        
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={locationLoading}
                                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {locationLoading ? (
                                        <>
                                            <span className="animate-spin">🔄</span>
                                            Getting Location...
                                        </>
                                    ) : (
                                        <>
                                            📍 Get My Location
                                        </>
                                    )}
                                </button>
                                
                                {(latitude || longitude) && (
                                    <button
                                        type="button"
                                        onClick={clearLocation}
                                        className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                    >
                                        Clear Location
                                    </button>
                                )}
                            </div>

                            {locationError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-600 text-sm">{locationError}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="latitude" className="block text-xs text-gray-500 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="e.g., 40.7128"
                                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="longitude" className="block text-xs text-gray-500 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="e.g., -74.0060"
                                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {latitude && longitude && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded">
                                    <p className="text-sm text-green-700">
                                        📍 Location: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="animate-spin inline-block mr-2">⏳</span>
                                Submitting Emergency Request...
                            </>
                        ) : (
                            "🚨 Send Emergency Request"
                        )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        * All fields are required. Your location helps emergency responders find you quickly.
                    </p>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-600 text-xl">✅</span>
                            <p className="text-green-800 font-semibold">Request Submitted Successfully</p>
                        </div>
                        <p className="text-green-700 text-sm">
                            Emergency responders have been notified and a task has been created. 
                            Help is on the way!
                        </p>
                        {taskId && (
                            <p className="text-green-600 text-xs mt-1">
                                Task ID: {taskId}
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-50 border rounded p-4 space-y-2">
                        <h3 className="font-semibold text-gray-800 mb-2">Request Details:</h3>
                        <div className="space-y-1 text-sm">
                            <p><strong>Help Needed:</strong> {help}</p>
                            <p><strong>Urgency Level:</strong> 
                                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                    urgencyType === 'high' ? 'bg-red-100 text-red-800' :
                                    urgencyType === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {urgencyType.toUpperCase()}
                                </span>
                            </p>
                            <p><strong>Location:</strong> {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            🗑️ Delete Request
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            Only delete if the emergency has been resolved or if you submitted by mistake.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}