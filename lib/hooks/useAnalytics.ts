import { useEffect, useState } from 'react';
import { initializeAnalytics, ensureUserId, logAnalyticsEvent, setUserProperty } from '../firebase';

// Hook to use Firebase Analytics in components
export function useAnalytics() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize analytics on the client side only
    const init = async () => {
      try {
        const success = await initializeAnalytics();
        setIsInitialized(success);
        
        if (success) {
          const id = ensureUserId();
          setUserId(id);
          // Log page view
          logAnalyticsEvent('page_view', {
            page_path: window.location.pathname,
            page_title: document.title,
          });
        }
      } catch (error) {
        console.error('Error initializing analytics:', error);
      }
    };
    
    init();
  }, []);

  // Wrapper function for logging events
  const logEvent = async (eventName: string, eventParams = {}) => {
    if (!isInitialized) {
      console.warn('Analytics not initialized. Event not logged:', eventName);
      return false;
    }
    
    return await logAnalyticsEvent(eventName, eventParams);
  };

  // Wrapper function for setting user properties
  const setUserProp = async (propertyName: string, value: string) => {
    if (!isInitialized) {
      console.warn('Analytics not initialized. User property not set:', propertyName);
      return false;
    }
    
    return await setUserProperty(propertyName, value);
  };

  return {
    isInitialized,
    userId,
    logEvent,
    setUserProperty: setUserProp,
  };
} 