import { useState, useEffect } from 'react';

interface RealtimeAnalytics {
  timestamp: string;
  activeVisitors: number;
  recentQueries: {
    document: string;
    query: string;
    responseTime: number;
    success: boolean;
    createdAt: string;
  }[];
  documentViews: {
    document: string;
    views: number;
    queries: number;
    lastViewed: string;
  }[];
}

export function useRealtimeAnalytics() {
  const [data, setData] = useState<RealtimeAnalytics | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/admin/analytics/realtime');

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const analyticsData = JSON.parse(event.data) as RealtimeAnalytics;
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse analytics data'));
      }
    };

    eventSource.onerror = (err) => {
      setError(new Error('Failed to connect to analytics stream'));
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return { data, error, isConnected };
} 