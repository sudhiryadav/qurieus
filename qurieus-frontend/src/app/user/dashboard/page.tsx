"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardData {
  totalQueries: number;
  successfulQueries: number;
  successRate: number;
  averageResponseTime: number;
  weeklyActivity: Array<{
    date: string;
    count: number;
  }>;
  trendingQueries: Array<{
    name: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    type: string;
    details: string;
  }>;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group and sum by day for weekly activity
  const weeklySums: Record<string, number> = {};
  dashboardData?.weeklyActivity.forEach(({ date, count }) => {
    if (!weeklySums[date]) weeklySums[date] = 0;
    weeklySums[date] += count;
  });
  const weeklyCategories = Object.keys(weeklySums);
  const weeklyCounts = Object.values(weeklySums);

  // Chart options
  const chartOptions = {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
      foreColor: "#64748b",
    },
    xaxis: {
      categories: weeklyCategories,
    },
    colors: ["#3758F9"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
    },
  };

  const chartSeries = [
    {
      name: "Queries",
      data: weeklyCounts,
    },
  ];

  // Line chart options for trending queries
  const lineChartOptions = {
    chart: {
      id: "trending-queries",
      toolbar: {
        show: false,
      },
      foreColor: "#64748b",
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    xaxis: {
      categories: dashboardData?.trendingQueries.map(q => q.name) || [],
    },
    colors: ["#10b981"],
    markers: {
      size: 4,
    },
    tooltip: {
      theme: "dark",
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  const lineChartSeries = [
    {
      name: "Query Count",
      data: dashboardData?.trendingQueries.map(q => q.count) || [],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">
        Welcome, {session?.user?.name}!
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Queries</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">{dashboardData?.totalQueries || 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Successful Queries</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">{dashboardData?.successfulQueries || 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">{dashboardData?.successRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">{dashboardData?.averageResponseTime.toFixed(0)}ms</p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Weekly Activity</h2>
          {mounted && (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={300}
            />
          )}
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Trending Queries</h2>
          {mounted && (
            <Chart
              options={lineChartOptions}
              series={lineChartSeries}
              type="line"
              height={300}
            />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b dark:border-dark-3">
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Query</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentActivity.map((activity, index) => (
                <tr key={index} className="border-b dark:border-dark-3">
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{activity.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      activity.type === 'Successful Query' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{activity.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 