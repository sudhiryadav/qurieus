'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart } from '@/components/ui/charts';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsService } from '@/services/analytics';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    const fetchAnalytics = async () => {
      if (!user?.id) return;
      try {
        const data = await AnalyticsService.getAnalytics(user.id, timeRange);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [user, timeRange, status, router]);

  if (status === 'loading' || loading) {
    return <div>Loading analytics...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange}>
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

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Query Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={analyticsData?.queryTrends || []}
                  xField="date"
                  yField="count"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={analyticsData?.responseTimeDistribution || []}
                  xField="range"
                  yField="count"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={analyticsData?.deviceDistribution || []}
                  nameField="device"
                  valueField="count"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={analyticsData?.browserDistribution || []}
                  nameField="browser"
                  valueField="count"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 