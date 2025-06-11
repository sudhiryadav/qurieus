import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export function RealtimeAnalytics() {
  const { data } = useRealtimeAnalytics();
  const [isConnected, setIsConnected] = useState(true);

  if (data.error) {
    return (
      <Card className="bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{data.error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Analytics...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time Analytics</h2>
        <Badge variant={isConnected ? "success" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.data.activeVisitors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.data.recentQueries.map((query, index) => (
              {data.recentQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{query.document}</p>
                    <p className="text-sm text-gray-500">{query.query}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={query.success ? "success" : "destructive"}>
                      {query.success ? "Success" : "Failed"}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.documentViews.map((view, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{view.document}</p>
                    <p className="text-sm text-gray-500">
                      {view.views} views • {view.queries} queries
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(view.lastViewed), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-gray-500 text-right">
        Last updated: {formatDistanceToNow(new Date(data.timestamp), { addSuffix: true })}
      </p>
    </div>
  );
} 