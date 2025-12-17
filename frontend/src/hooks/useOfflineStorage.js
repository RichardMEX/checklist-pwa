import { useState, useEffect } from 'react';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineChecklist = (checklistData) => {
    const offlineData = JSON.parse(localStorage.getItem('offlineChecklists') || '[]');
    offlineData.push({
      ...checklistData,
      offline: true,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('offlineChecklists', JSON.stringify(offlineData));
  };

  const getOfflineChecklists = () => {
    return JSON.parse(localStorage.getItem('offlineChecklists') || '[]');
  };

  const clearOfflineChecklists = () => {
    localStorage.removeItem('offlineChecklists');
  };

  return {
    isOnline,
    saveOfflineChecklist,
    getOfflineChecklists,
    clearOfflineChecklists
  };
};