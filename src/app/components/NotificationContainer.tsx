'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { removeNotification } from '@/lib/features/notifications/notificationSlice';
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';

export default function NotificationContainer() {
  const notifications = useAppSelector(state => state.notifications.notifications);
  const dispatch = useAppDispatch();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-5 h-5" />;
      case 'error':
        return <FaTimes className="w-5 h-5" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'info':
        return <FaInfo className="w-5 h-5" />;
      default:
        return <FaInfo className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-md w-full border rounded-lg p-4 shadow-lg transition-all duration-300 ${getStyles(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="ml-4 flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
