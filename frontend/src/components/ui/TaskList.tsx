import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import app from '../../services/firebase';
import { authService } from '../../services/auth';

interface Task {
  task_id: string;
  description: string;
  emergency_type: string;
  latitude: number;
  longitude: number;
  people_count: string;
  roles: string[];
  status: string;
  urgency_level: string;
  complete_by?: string;
}

interface TaskListProps {
  disasterId: string;
  role: 'gov' | 'fr' | 'vol';
}

export default function TaskList({ disasterId, role }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const payload = authService.getTokenPayload();


  useEffect(() => {
    const db = getDatabase(app);
    const tasksRef = ref(db, `tasks/${disasterId}`);

    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTasks = Object.values(data) as Task[];
        let filteredTasks = loadedTasks;

        if (role !== 'gov') {
          filteredTasks = loadedTasks.filter(task =>
            task.roles.includes(role)
          );
        }

        filteredTasks.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });

        setTasks(filteredTasks);
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, [disasterId, role]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const db = getDatabase(app);
    const taskRef = ref(db, `tasks/${disasterId}/${taskId}`);

    const updateData: Partial<Task> = { status: newStatus };
    if (newStatus === 'complete') updateData.complete_by = payload?.email;

    try {
      await update(taskRef, updateData);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getAvailableStatuses = () => {
    return role === 'gov'
      ? ['pending', 'complete', 'cancel']
      : ['pending', 'complete'];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'cancel':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
  <div className="p-6 max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Task List</h2>

    {tasks.length === 0 ? (
      <div className="text-gray-600 text-center mt-10">No tasks available</div>
    ) : (
      <ul className="space-y-6">
        {tasks.map((task) => (
          <li key={task.task_id} className="p-6 rounded-xl border bg-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{task.description}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status.toUpperCase()}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <p><strong>Emergency:</strong> {task.emergency_type}</p>
              <p><strong>People Count:</strong> {task.people_count}</p>
              <p><strong>Urgency:</strong> {task.urgency_level}</p>
              <p><strong>Roles:</strong> {task.roles.join(', ')}</p>
              <p>
                <strong>Location:</strong>{' '}
                <a
                  href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View on Map
                </a>
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Update Status</label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                className="w-full md:w-60 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableStatuses().map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {task.complete_by && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>Completed By:</strong> {task.complete_by}
              </p>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

}
