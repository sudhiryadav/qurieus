import axiosInstance from "@/lib/axios";
export class AnalyticsService {
  // Track query
  static async trackQuery({
    userId,
    documentId,
    query,
    response,
    responseTime,
    visitorId,
    success
  }: {
    userId: string;
    documentId: string;
    query: string;
    response: string;
    responseTime: number;
    visitorId: string;
    success: boolean;
  }) {
    try {
      const apiResponse = await axiosInstance.post('/api/admin/analytics/track', {
        userId,
        documentId,
        query,
        response,
        responseTime,
        visitorId,
        success
      });

      return apiResponse.data;
    } catch (error) {
      console.error('Error tracking query:', error);
      throw error;
    }
  }

  // Track visitor session
  static async trackSession({
    userId,
    visitorId,
    userAgent,
    ipAddress
  }: {
    userId: string;
    visitorId: string;
    userAgent: string;
    ipAddress: string;
  }) {
    try {
      const apiResponse = await axiosInstance.post('/api/admin/analytics/session', {
        userId,
        visitorId,
        userAgent,
        ipAddress
      });

      return apiResponse.data;
    } catch (error) {
      console.error('Error tracking session:', error);
      throw error;
    }
  }

  // Update visitor session
  static async updateVisitorSession(
    sessionId: string,
    updates: {
      endTime?: Date;
      duration?: number;
      pageViews?: number;
      queries?: number;
    },
  ) {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/analytics/session/${sessionId}`,
        updates,
      );

      return response.data;
    } catch (error) {
      console.error("Error updating visitor session:", error);
      throw error;
    }
  }

  // Get active sessions
  static async getActiveSessions(userId: string) {
    try {
      const response = await axiosInstance.get(
        `/api/admin/analytics/sessions/active?userId=${userId}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error getting active sessions:", error);
      throw error;
    }
  }

  static async getAnalytics(userId: string, timeRange: string) {
    try {
      const response = await axiosInstance.get(
        `/api/admin/analytics?userId=${userId}&timeRange=${timeRange}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error getting analytics:", error);
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
      const response = await axiosInstance.get(`/api/admin/analytics?userId=${userId}`);

      return response.data;
    } catch (error) {
      console.error("Error getting user analytics:", error);
      return {
        totalQueries: 0,
        avgResponseTime: 0,
        successRate: 0,
        recentQueries: [],
      };
    }
  }
}
