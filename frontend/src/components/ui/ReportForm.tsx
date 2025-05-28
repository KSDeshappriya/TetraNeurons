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
    const userId = authService.getTokenPayload()?.uid;
    const [submitting, setSubmitting] = useState(false);

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
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatitude(pos.coords.latitude.toString());
                setLongitude(pos.coords.longitude.toString());
            },
            () => alert("Failed to get location")
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!help.trim() || !urgencyType || !latitude || !longitude) {
            alert("All fields are required. Please fill them out and get your location.");
            return;
        }

        setSubmitting(true); // disable the button

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
        } catch {
            alert("Failed to send report.");
        } finally {
            setSubmitting(false); // re-enable only if needed
        }
    };



    const handleDelete = async () => {
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
        } catch (error) {
            console.error("Failed to delete request:", error);
            alert("Failed to delete request");
        }
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
                    <textarea
                        value={help}
                        onChange={(e) => setHelp(e.target.value)}
                        required
                        placeholder="Help Needed"
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                    <select
                        value={urgencyType}
                        onChange={(e) => setUrgencyType(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Urgency</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>

                    <button
                        type="button"
                        onClick={getLocation}
                        className="px-3 py-2 bg-gray-200 rounded mx-2 hover:bg-gray-300"
                    >
                        📍 Get My Location
                    </button>

                    {latitude && longitude && (
                        <p className="text-sm text-gray-500">
                            Location: {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Send Emergency Request"}
                    </button>

                </form>
            ) : (
                <div className="p-4 bg-gray-100 rounded space-y-2">
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                        <p className="text-green-800 font-medium">✅ Request Submitted Successfully</p>
                        <p className="text-green-600 text-sm">Emergency responders have been notified and a task has been created.</p>
                    </div>

                    <p><strong>Help Needed:</strong> {help}</p>
                    <p><strong>Urgency:</strong> {urgencyType}</p>
                    <p><strong>Location:</strong> {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}</p>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onDoubleClick={handleDelete} // Require double click for safety
                        >
                            Delete Request
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        *Double-click delete to confirm removal
                    </p>
                </div>
            )}
        </div>
    );
}