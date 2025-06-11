import { getDeviceInfo } from '@/utils/deviceInfo';
import { getLocationInfo } from '@/utils/locationInfo';

interface QueryStats {
  documentId: string;
  _count: {
    _all: number;
    success: number;
  };
  _avg: {
    responseTime: number | null;
  };
}

interface VisitorStats {
  userId: string;
  _count: {
    visitorId: number;
  };
  _avg: {
    duration: number | null;
    queries: number | null;
  };
}

export class AnalyticsService {
  // Track query
  static async trackQuery({
    documentId,
    query,
    response: responseText,
    responseTime,
    userId,
    visitorId,
    success,
  }: {
    documentId: string;
    query: string;
    response: string;
    responseTime: number;
    userId: string;
    visitorId: string;
    success: boolean;
  }) {
    try {
      const response = await fetch('/api/admin/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          query,
          response: responseText,
          responseTime,
          userId,
          visitorId,
          success,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track query');
      }
    } catch (error) {
      console.error('Error tracking query:', error);
    }
  }

  // Track visitor session
  static async trackVisitorSession({
    userId,
    visitorId,
    userAgent,
    ipAddress,
    startTime,
    endTime,
    duration,
    queries,
  }: {
    userId: string;
    visitorId: string;
    userAgent: string;
    ipAddress: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    queries: number;
  }) {
    try {
      const response = await fetch('/api/admin/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          visitorId,
          userAgent,
          ipAddress,
          startTime,
          endTime,
          duration,
          queries,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track visitor session');
      }
    } catch (error) {
      console.error('Error tracking visitor session:', error);
    }
  }

  // Update visitor session
  static async updateVisitorSession(sessionId: string, updates: {
    endTime?: Date;
    duration?: number;
    pageViews?: number;
    queries?: number;
  }) {
    try {
      const response = await fetch(`/api/admin/analytics/session/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update visitor session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating visitor session:', error);
      throw error;
    }
  }

  // Get active sessions
  static async getActiveSessions(userId: string) {
    try {
      const response = await fetch(`/api/admin/analytics/sessions/active?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get active sessions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  static async getAnalytics(userId: string, timeRange: string) {
    try {
      const response = await fetch(`/api/admin/analytics?userId=${userId}&timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to get analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalQueries: 0,
        avgResponseTime: 0,
        successRate: 0,
        queryStats: [],
        visitorStats: [],
      };
    }
  }

  static async getUserAnalytics(userId: string) {
    try {
      const response = await fetch(`/api/admin/analytics?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get user analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {
        totalQueries: 0,
        avgResponseTime: 0,
        successRate: 0,
        recentQueries: [],
      };
    }
  }
} 