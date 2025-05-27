import { useState, useMemo } from 'react';

const LogsSection = ({ logs }: { logs: any[] }) => {
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    if (!search) return logs;
    return logs.filter((log) =>
      JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
    );
  }, [search, logs]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-gray-500 mr-2">📝</span>
        System Logs
      </h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
      />

      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(filteredLogs, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LogsSection;
