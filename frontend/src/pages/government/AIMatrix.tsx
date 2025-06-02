import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import app from '../../services/firebase';
import NavigationBar from '../../components/layout/Navigationbar';
import Footer from '../../components/layout/Footer';
import LogsSection from '../../components/ui/LogsSection';

const useLocation = () => ({
  search: window.location.search
});

const AIMatrixPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const disasterId = searchParams.get('id');
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
   const [taskData, setTaskData] = useState({
    firstTask: null,
    lastTask: null
  });

  useEffect(() => {
    if (!disasterId) return;
    
    const fetchTasks = async () => {
      const db = getDatabase(app);
      const tasksRef = ref(db, `tasks/${disasterId}`);
      
      try {
        const snapshot = await get(tasksRef);
        if (snapshot.exists()) {
          const tasks = snapshot.val();
          
          // Find first task (first_Task: true)
          const firstTask = Object.values(tasks).find(task => task.first_Task === true);
          
          // Find last task (most recent timestamp with first_Task: false)
          const nonFirstTasks = Object.values(tasks)
            .filter(task => task.first_Task === false)
            .sort((a, b) => b.timestamp - a.timestamp);
          
          const lastTask = nonFirstTasks[0];
          
          setTaskData({
            firstTask,
            lastTask
          });
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [disasterId]);

  useEffect(() => {
    if (!disasterId) return;
    const db = getDatabase(app);
    const matrixRef = ref(db, `ai_matrixes/${disasterId}`);
    get(matrixRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setMatrixData(snapshot.val());
        } else {
          console.warn('No data found for disasterId:', disasterId);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching AI matrix:', error);
        setLoading(false);
      });
  }, [disasterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Matrix Report...</p>
        </div>
      </div>
    );
  }

  if (!matrixData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600">Unable to find AI Matrix data for the requested disaster ID.</p>
        </div>
      </div>
    );
  }

  const {
    disaster_id,
    emergency_context,
    final_status,
    logs,
    processing_end_time,
    processing_start_time,
    total_processing_time,
  } = matrixData;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'processing':
      case 'running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format timestamp - your data is already in Unix timestamp format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Matrix Report</h1>
                <p className="text-gray-600 mt-1">Disaster ID: {disaster_id || disasterId}</p>
              </div>
              
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Processing Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-green-500 mr-2">⚡</span>
                Processing Details
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600 font-medium">Start Time:</span>
                  <span className="text-gray-900 text-sm">{formatTimestamp(processing_start_time)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600 font-medium">End Time:</span>
                  <span className="text-gray-900 text-sm">{formatTimestamp(processing_end_time)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600 font-medium">Total Duration:</span>
                  <span className="text-gray-900 font-semibold">
                    {total_processing_time ? `${total_processing_time.toFixed(2)}s` : 'Unknown'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600 font-medium">Final Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor("success")}`}>
                    success
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Context */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-red-500 mr-2">🚨</span>
                Emergency Context
              </h2>
              {emergency_context ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-600 font-medium">Emergency Type:</span>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm capitalize">
                      {emergency_context.emergency_type || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-600 font-medium">Urgency Level:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${getUrgencyColor(emergency_context.urgency_level)}`}>
                      {emergency_context.urgency_level || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-600 font-medium">People Affected:</span>
                    <span className="text-gray-900 font-semibold">{emergency_context.people_count || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-600 font-medium">Location:</span>
                    <span className="text-gray-900 text-sm">
                      {emergency_context.latitude && emergency_context.longitude
                        ? `${emergency_context.latitude}, ${emergency_context.longitude}`
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No emergency context data available</p>
              )}
            </div>
          </div>

<div className="bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl shadow-lg border border-gray-200 p-8 transition-all duration-300 hover:shadow-xl my-3">
  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
    <span className="text-blue-500 mr-3 text-2xl">🧠</span>
    Emergency Report AI Agents Information
  </h2>

  {matrixData?.components_status ? (
    <div className="space-y-8">

      {/* AI Agents */}
      <div>
        <h3 className="text-gray-800 font-semibold text-base mb-3 flex items-center gap-2">
          🤖 AI Agents 
        </h3>
        <ul className="space-y-2 text-sm">
          {Object.entries(matrixData.components_status)
            .filter(([key]) => key.includes('_ai'))
            .map(([name, status]) => (
              <li key={name} className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <span className="capitalize text-gray-700 font-medium">
                  {name.replace(/_/g, ' ')}
                </span>
                <span
                  className={`capitalize px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-all duration-200 ${
                    status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {status}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Tools */}
      <div>
        <h3 className="text-gray-800 font-semibold text-base mb-3 flex items-center gap-2">
          🛠️ Tools
        </h3>
        <ul className="space-y-2 text-sm">
          {Object.entries(matrixData.components_status)
            .filter(([key]) => key.includes('_tool'))
            .map(([name, status]) => (
              <li key={name} className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <span className="capitalize text-gray-700 font-medium">
                  {name.replace(/_/g, ' ')}
                </span>
                <span
                  className={`capitalize px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-all duration-200 ${
                    status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {status}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Summary */}
      <div className="pt-6 border-t mt-6 text-sm text-gray-700 space-y-2">
        <div className="flex justify-between">
          <span>Total Components:</span>
          <span className="font-bold">
            {matrixData.components_summary.total_components}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Completed:</span>
          <span className="font-bold text-green-600">
            {matrixData.components_summary.completed_components}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Failed:</span>
          <span className="font-bold text-red-600">
            {matrixData.components_summary.failed_components}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Success Rate:</span>
          <span className="font-bold text-blue-600">
            {matrixData.components_summary.success_rate}%
          </span>
        </div>

        {/* Visual Success Rate Bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${matrixData.components_summary.success_rate}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">Visual representation of success rate</p>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-gray-500 italic">No component status data available</p>
  )}
</div>

          {/* Logs Section - Only show if logs exist */}
          {logs && <LogsSection logs={logs} />}
 {/* Task Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 my-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-purple-500 mr-2">📋</span>
              Task Workflow Agents Information
            </h2>

            <div className="space-y-6 ">
              {/* First Task */}
              {taskData.firstTask && (
                <div className="border-b pb-4">
                  <h3 className="text-md font-medium text-gray-800 mb-2">Initial Task Generator Agent</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fallback Status:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        taskData.firstTask.is_fallback 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {taskData.firstTask.is_fallback ? 'True' : 'False'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Timestamp:</span>
                      <span className="text-sm text-gray-800">
                        {new Date(taskData.firstTask.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{taskData.firstTask.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Task */}
              {taskData.lastTask && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-2">User Request Task Generator Agent</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fallback Status:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        taskData.lastTask.is_fallback 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {taskData.lastTask.is_fallback ? 'True' : 'False'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Timestamp:</span>
                      <span className="text-sm text-gray-800">
                        {new Date(taskData.lastTask.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{taskData.lastTask.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {!taskData.firstTask && !taskData.lastTask && (
                <p className="text-gray-500 italic">No task data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIMatrixPage;