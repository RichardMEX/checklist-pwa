import { useEffect } from 'react';

export const usePushNotifications = () => {
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notificaciones permitidas');
        }
      });
    }
  }, []);
};

export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
  }
};