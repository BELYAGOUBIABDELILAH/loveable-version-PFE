import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    analytics.pageView(location.pathname, user?.id);
  }, [location.pathname, user?.id]);

  return analytics;
};
