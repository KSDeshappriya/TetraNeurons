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
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    created_at,
    created_at_iso,
    processing_start_time,
    processing_end_time,
    total_processing_time,
    agents_summary,
    agents_status,
    final_status,
    logs,
    emergency_context,
  } = matrixData;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
      case 'running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
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
              <p className="text-gray-600 mt-1">Disaster ID: {disasterId}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(final_status)}`}>
              {final_status || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-500 mr-2">📊</span>
              Basic Information
            </h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Created At:</span>
                <span className="text-gray-900">{new Date(created_at * 1000).toLocaleString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">ISO Format:</span>
                <span className="text-gray-900 text-sm break-all">{created_at_iso}</span>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-green-500 mr-2">⚡</span>
              Processing Details
            </h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Start Time:</span>
                <span className="text-gray-900 text-sm">{processing_start_time}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">End Time:</span>
                <span className="text-gray-900 text-sm">{processing_end_time}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600 font-medium">Total Duration:</span>
                <span className="text-gray-900 font-semibold">{total_processing_time?.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-purple-500 mr-2">🤖</span>
            Agents Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{agents_summary?.total_agents || 0}</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{agents_summary?.completed_agents || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{agents_summary?.failed_agents || 0}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{agents_summary?.success_rate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Emergency Context */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-red-500 mr-2">🚨</span>
            Emergency Context
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <span className="text-gray-600 font-medium block">Emergency Type:</span>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {emergency_context?.emergency_type || 'Unknown'}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 font-medium block">Urgency Level:</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${getUrgencyColor(emergency_context?.urgency_level)}`}>
                {emergency_context?.urgency_level || 'Unknown'}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 font-medium block">People Affected:</span>
              <span className="text-gray-900 font-semibold">{emergency_context?.people_count || 'Unknown'}</span>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <span className="text-gray-600 font-medium block">Location:</span>
              <span className="text-gray-900 text-sm">
                {emergency_context?.latitude && emergency_context?.longitude 
                  ? `${emergency_context.latitude}, ${emergency_context.longitude}`
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-indigo-500 mr-2">📋</span>
            Agent Status Details
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(agents_status, null, 2)}
            </pre>
          </div>
        </div>

        <LogsSection logs={logs} />

      </div>
    </div>
    <Footer />
    </>
  );
};

export default AIMatrixPage;