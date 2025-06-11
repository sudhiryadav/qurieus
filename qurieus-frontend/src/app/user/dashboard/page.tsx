"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { AnalyticsService } from '@/services/analytics';

export default function UserDashboard() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user) return;
      try {
        const data = await AnalyticsService.getUserAnalytics(session.user.id);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching user analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyticsData?.totalQueries || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyticsData?.avgResponseTime?.toFixed(2) || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyticsData?.successRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {analyticsData?.recentQueries?.map((query: any) => (
            <Card key={query.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{query.query}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(query.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Response time: {query.responseTime}ms
                    </p>
                    <p className="text-sm">
                      Status:{' '}
                      <span
                        className={
                          query.success ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        {query.success ? 'Success' : 'Failed'}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 