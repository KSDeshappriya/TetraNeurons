import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import app from '../../services/firebase';
import NavigationBar from '../../components/layout/Navigationbar';
import Footer from '../../components/layout/Footer';
import LogsSection from '../../components/ui/LogsSection';

// Type definitions
interface EmergencyContext {
  emergency_type?: string;
  urgency_level?: string;
  people_count?: number;
  latitude?: number;
  longitude?: number;
}

interface ComponentsSummary {
  total_components: number;
  completed_components: number;
  failed_components: number;
  success_rate: number;
}

interface MatrixData {
  disaster_id?: string;
  emergency_context?: EmergencyContext;
  final_status?: string;
  logs?: any[];
  processing_end_time?: number;
  processing_start_time?: number;
  total_processing_time?: number;
  components_status?: Record<string, string>;
  components_summary?: ComponentsSummary;
}

interface Task {
  first_Task: boolean;
  is_fallback: boolean;
  timestamp: number;
  description: string;
}

interface TaskData {
  firstTask: Task | null;
  lastTask: Task | null;
}

const useLocation = () => ({
  search: window.location.search
});

const AIMatrixPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const disasterId = searchParams.get('id');
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [taskData, setTaskData] = useState<TaskData>({
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
          const tasks = snapshot.val() as Record<string, Task>;
          
          // Find first task (first_Task: true)
          const firstTask = Object.values(tasks).find((task: Task) => task.first_Task === true) || null;
          
          // Find last task (most recent timestamp with first_Task: false)
          const nonFirstTasks = Object.values(tasks)
            .filter((task: Task) => task.first_Task === false)
            .sort((a: Task, b: Task) => b.timestamp - a.timestamp);
          
          const lastTask = nonFirstTasks[0] || null;
          
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
          setMatrixData(snapshot.val() as MatrixData);
        } else {
          console.warn('No data found for disasterId:', disasterId);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching Ai Metrics:', error);
        setLoading(false);
      });
  }, [disasterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading Ai Metrics Report...</p>
        </div>
      </div>
    );
  }

  if (!matrixData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-10 text-center">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Data Found</h2>
          <p className="text-gray-600 text-lg">Unable to find Ai Metrics data for the requested disaster ID.</p>
        </div>
      </div>
    );
  }

  const {
    disaster_id,
    emergency_context,
    logs,
    processing_end_time,
    processing_start_time,
    total_processing_time,
  } = matrixData;

  const getStatusColor = (status: string | undefined): string => {
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

  const getUrgencyColor = (urgency: string | undefined): string => {
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
  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Ai Metrics Report</h1>
              <p className="text-xl text-gray-600">Disaster ID: <span className="font-semibold text-gray-800">{disaster_id || disasterId}</span></p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Processing Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-green-600 text-2xl">⚡</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Processing Details</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-lg">Start Time</span>
                  <span className="text-gray-900 font-semibold">{formatTimestamp(processing_start_time)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-lg">End Time</span>
                  <span className="text-gray-900 font-semibold">{formatTimestamp(processing_end_time)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-lg">Total Duration</span>
                  <span className="text-gray-900 font-bold text-xl">
                    {total_processing_time ? `${total_processing_time.toFixed(2)}s` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium text-lg">Final Status</span>
                  <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor("success")}`}>
                    Success
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Context Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-red-600 text-2xl">🚨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Context</h2>
              </div>
              
              {emergency_context ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-lg">Emergency Type</span>
                    <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-semibold capitalize">
                      {emergency_context.emergency_type || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-lg">Urgency Level</span>
                    <span className={`px-4 py-2 rounded-lg font-semibold capitalize ${getUrgencyColor(emergency_context.urgency_level)}`}>
                      {emergency_context.urgency_level || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-lg">People Affected</span>
                    <span className="text-gray-900 font-bold text-xl">{emergency_context.people_count || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium text-lg">Location</span>
                    <span className="text-gray-900 font-semibold text-right">
                      {emergency_context.latitude && emergency_context.longitude
                        ? `${emergency_context.latitude}, ${emergency_context.longitude}`
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg italic">No emergency context data available</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Agents Information Card */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-blue-600 text-3xl">🧠</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Emergency Report AI Agents Information</h2>
            </div>

            {matrixData?.components_status ? (
              <div className="space-y-10">
                
                {/* AI Agents Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <span className="text-2xl mr-3">🤖</span>
                    <h3 className="text-xl font-bold text-gray-800">AI Agents</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(matrixData.components_status)
                      .filter(([key]) => key.includes('_ai'))
                      .map(([name, status]) => (
                        <div key={name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-semibold text-lg capitalize">
                              {name.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                                status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Tools Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <span className="text-2xl mr-3">🛠️</span>
                    <h3 className="text-xl font-bold text-gray-800">Tools</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(matrixData.components_status)
                      .filter(([key]) => key.includes('_tool'))
                      .map(([name, status]) => (
                        <div key={name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-semibold text-lg capitalize">
                              {name.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                                status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Summary Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {matrixData.components_summary?.total_components || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Total Components</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {matrixData.components_summary?.completed_components || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-1">
                        {matrixData.components_summary?.failed_components || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {matrixData.components_summary?.success_rate || 0}%
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                    </div>
                  </div>

                  {/* Visual Success Rate Bar */}
                  <div className="mt-8">
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${matrixData.components_summary?.success_rate || 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-3 font-medium">Success Rate Visualization</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-xl italic">No component status data available</p>
              </div>
            )}
          </div>

          {/* Task Workflow Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-purple-600 text-3xl">📋</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Task Workflow Agents Information</h2>
            </div>

            <div className="space-y-8">
              {/* First Task */}
              {taskData.firstTask && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Initial Task Generator Agent</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium text-lg">Fallback Status</span>
                      <span className={`px-4 py-2 rounded-lg font-semibold ${
                        taskData.firstTask.is_fallback 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {taskData.firstTask.is_fallback ? 'True' : 'False'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium text-lg">Timestamp</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(taskData.firstTask.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{taskData.firstTask.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Task */}
              {taskData.lastTask && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">User Request Task Generator Agent</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium text-lg">Fallback Status</span>
                      <span className={`px-4 py-2 rounded-lg font-semibold ${
                        taskData.lastTask.is_fallback 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {taskData.lastTask.is_fallback ? 'True' : 'False'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium text-lg">Timestamp</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(taskData.lastTask.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{taskData.lastTask.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {!taskData.firstTask && !taskData.lastTask && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-xl italic">No task data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Logs Section - Only show if logs exist */}
          {logs && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <LogsSection logs={logs} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIMatrixPage;