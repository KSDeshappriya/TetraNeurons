import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'emergency';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 w-80">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`rounded-lg shadow-lg p-4 transition-all duration-300 transform translate-x-0 
            ${notification.type === 'success' ? 'bg-success-500 text-white' :
              notification.type === 'error' ? 'bg-emergency-500 text-white' :
              notification.type === 'warning' ? 'bg-warning-500 text-white' :
              notification.type === 'emergency' ? 'bg-emergency-600 text-white' :
              'bg-primary-500 text-white'
            }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-white opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationProvider;
