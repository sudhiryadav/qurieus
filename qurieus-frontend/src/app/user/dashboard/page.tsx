"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import axiosInstance from "@/lib/axios";
import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle2,
  Percent,
  Clock,
} from "lucide-react";
// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/app-theme";

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
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const chartIsDark = resolvedTheme === "dark";

  // Redirect agents to agent dashboard
  useEffect(() => {
    if (session?.user?.role === "AGENT") {
      router.push("/agent/dashboard");
    }
  }, [session?.user?.role, router]);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id || session?.user?.role === "AGENT") return;
    try {
      const response = await axiosInstance.get('/api/admin/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.role]);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Group and sum by day for weekly activity
  const weeklySums: Record<string, number> = {};
  dashboardData?.weeklyActivity?.forEach(({ date, count }) => {
    if (!weeklySums[date]) weeklySums[date] = 0;
    weeklySums[date] += count;
  });
  const weeklyCategories = Object.keys(weeklySums);
  const weeklyCounts = Object.values(weeklySums);

  // Chart options — match light/dark card surfaces so labels and grids stay readable
  const chartOptions = useMemo(
    () => ({
      chart: {
        id: "basic-bar",
        toolbar: {
          show: false,
        },
        foreColor: chartIsDark ? "#94a3b8" : "#64748b",
      },
      theme: {
        mode: chartIsDark ? ("dark" as const) : ("light" as const),
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
        borderColor: chartIsDark ? "#334155" : "#f1f5f9",
        strokeDashArray: 4,
      },
      tooltip: {
        theme: chartIsDark ? "dark" : "light",
      },
    }),
    [chartIsDark, weeklyCategories]
  );

  const chartSeries = [
    {
      name: "Queries",
      data: weeklyCounts,
    },
  ];

  // Line chart options for trending queries
  const lineChartOptions = useMemo(
    () => ({
      chart: {
        id: "trending-queries",
        toolbar: {
          show: false,
        },
        foreColor: chartIsDark ? "#94a3b8" : "#64748b",
      },
      theme: {
        mode: chartIsDark ? ("dark" as const) : ("light" as const),
      },
      stroke: {
        curve: "smooth" as const,
        width: 2,
      },
      xaxis: {
        categories: dashboardData?.trendingQueries?.map((q) => q.name) ?? [],
      },
      colors: ["#10b981"],
      markers: {
        size: 4,
      },
      tooltip: {
        theme: chartIsDark ? "dark" : "light",
      },
      grid: {
        borderColor: chartIsDark ? "#334155" : "#f1f5f9",
        strokeDashArray: 4,
      },
    }),
    [chartIsDark, dashboardData?.trendingQueries]
  );

  const lineChartSeries = [
    {
      name: "Query Count",
      data: dashboardData?.trendingQueries?.map((q) => q.count) ?? [],
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Welcome, {session?.user?.name}!
        </h1>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {(
          [
            {
              label: "Total Queries",
              value: String(dashboardData?.totalQueries ?? 0),
              Icon: MessageSquare,
              wrap: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
            },
            {
              label: "Successful Queries",
              value: String(dashboardData?.successfulQueries ?? 0),
              Icon: CheckCircle2,
              wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
            },
            {
              label: "Success Rate",
              value: `${(dashboardData?.successRate ?? 0).toFixed(1)}%`,
              Icon: Percent,
              wrap: "bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300",
            },
            {
              label: "Avg Response Time",
              value: `${(dashboardData?.averageResponseTime ?? 0).toFixed(0)}ms`,
              Icon: Clock,
              wrap: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
            },
          ] as const
        ).map(({ label, value, Icon, wrap }) => (
          <div
            key={label}
            className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
              </h2>
              <span
                className={`flex shrink-0 rounded-lg p-2 ${wrap}`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-dark dark:text-white">
              {value}
            </p>
          </div>
        ))}
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
        <LoadingOverlay loading={loading} htmlText="Loading dashboard data..." position="absolute" />
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
        {!loading && (!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) && (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
        )}
        </div>
      </div>
    </div>
  );
} 