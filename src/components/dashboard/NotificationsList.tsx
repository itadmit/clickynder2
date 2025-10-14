'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, X, Clock, CheckCircle, Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'new_appointment' | 'cancelled_appointment' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  appointmentId?: string;
  customerId?: string;
}

interface NotificationsListProps {
  notifications: Notification[];
}

export function NotificationsList({ notifications: initialNotifications }: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'cancelled_appointment':
        return <X className="w-5 h-5 text-red-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'system':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: he,
      });
    } catch {
      return '';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.appointmentId) {
      router.push(`/dashboard/appointments/${notification.appointmentId}`);
    } else if (notification.customerId) {
      router.push(`/dashboard/customers/${notification.customerId}`);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">כל ההתראות</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} התראות חדשות
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              סמן הכל כנקרא
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            הכל ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            לא נקראו ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {filter === 'unread' ? 'אין התראות חדשות' : 'אין התראות'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${
                !notification.read ? 'bg-blue-50/30' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-primary-100' : 'bg-gray-100'
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="סמן כנקרא"
                        >
                          <Check className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="מחק"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


