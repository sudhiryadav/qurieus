"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChatAnalytics {
  totalConversations: number;
  totalMessages: number;
  averageMessagesPerDay: number;
  topKeywords: { keyword: string; count: number }[];
  messagesByDate: { date: string; count: number }[];
  uniqueVisitors: number;
  responseTime: { average: number; min: number; max: number };
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
  osStats: { os: string; count: number }[];
  avgMessagesPerConversation: number;
  avgResponseTime: number;
}

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d
  const [mounted, setMounted] = useState(false);

  // Wait until component is mounted to render charts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication state
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Fetch analytics data based on time range
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (status !== "authenticated") return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for sending cookies
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Please sign in to view analytics");
            router.push("/signin");
            return;
          }
          throw new Error("Failed to fetch analytics data");
        }
        
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [timeRange, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (status !== "authenticated") {
    return null;
  }

  // Chart options for messages by date
  const timeSeriesOptions = {
    chart: {
      id: "messages-by-date",
      toolbar: {
        show: false,
      },
      foreColor: "#64748b",
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    xaxis: {
      categories: analytics?.messagesByDate.map(item => item.date) || [],
      type: "datetime" as const,
    },
    yaxis: {
      title: {
        text: "Message Count",
      },
    },
    colors: ["#3758F9"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#3758F9"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 0.8,
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        format: "yyyy-MM-dd",
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  const timeSeriesSeries = [
    {
      name: "Messages",
      data: analytics?.messagesByDate.map(item => item.count) || [],
    },
  ];

  // Chart options for top keywords
  const keywordsChartOptions = {
    chart: {
      id: "top-keywords",
      toolbar: {
        show: false,
      },
      foreColor: "#64748b",
    },
    plotOptions: {
      bar: {
        horizontal: true as const,
        borderRadius: 4,
        dataLabels: {
          position: "top" as const,
        },
      },
    },
    colors: ["#10b981"],
    xaxis: {
      categories: analytics?.topKeywords.map(item => item.keyword) || [],
    },
    tooltip: {
      theme: "dark" as const,
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  const keywordsChartSeries = [
    {
      name: "Occurrences",
      data: analytics?.topKeywords.map(item => item.count) || [],
    },
  ];

  // Chart options for device stats
  const deviceChartOptions = {
    chart: {
      type: "donut" as const,
      toolbar: {
        show: false,
      },
    },
    labels: analytics?.deviceStats.map(item => item.device) || [],
    colors: ["#3b82f6", "#10b981", "#f59e0b"],
    legend: {
      position: "bottom" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
  };

  const deviceChartSeries = analytics?.deviceStats.map(item => item.count) || [];

  // Chart options for browser stats
  const browserChartOptions = {
    chart: {
      type: "donut" as const,
      toolbar: {
        show: false,
      },
    },
    labels: analytics?.browserStats.map(item => item.browser) || [],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    legend: {
      position: "bottom" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
  };

  const browserChartSeries = analytics?.browserStats.map(item => item.count) || [];

  // Chart options for OS stats
  const osChartOptions = {
    chart: {
      type: "donut" as const,
      toolbar: {
        show: false,
      },
    },
    labels: analytics?.osStats.map(item => item.os) || [],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    legend: {
      position: "bottom" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
  };

  const osChartSeries = analytics?.osStats.map(item => item.count) || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Chat Analytics</h1>
        
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={`rounded-l-md px-4 py-2 text-sm font-medium ${
              timeRange === "7d"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === "30d"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("90d")}
            className={`rounded-r-md px-4 py-2 text-sm font-medium ${
              timeRange === "90d"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Conversations</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">{analytics?.totalConversations}</p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Messages</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">{analytics?.totalMessages}</p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Unique Visitors</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">{analytics?.uniqueVisitors}</p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Messages/Day</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">{analytics?.averageMessagesPerDay}</p>
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {analytics?.avgResponseTime.toFixed(2)}s
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Messages/Conversation</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {analytics?.avgMessagesPerConversation.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Min Response Time</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {analytics?.responseTime.min.toFixed(2)}s
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Max Response Time</h2>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {analytics?.responseTime.max.toFixed(2)}s
              </p>
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Messages Over Time</h2>
              {mounted && analytics && (
                <Chart
                  options={timeSeriesOptions}
                  series={timeSeriesSeries}
                  type="area"
                  height={350}
                />
              )}
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Top Keywords</h2>
              {mounted && analytics && (
                <Chart
                  options={keywordsChartOptions}
                  series={keywordsChartSeries}
                  type="bar"
                  height={350}
                />
              )}
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Device Distribution</h2>
              {mounted && analytics && (
                <Chart
                  options={deviceChartOptions}
                  series={deviceChartSeries}
                  type="donut"
                  height={350}
                />
              )}
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Browser Distribution</h2>
              {mounted && analytics && (
                <Chart
                  options={browserChartOptions}
                  series={browserChartSeries}
                  type="donut"
                  height={350}
                />
              )}
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h2 className="mb-4 text-lg font-medium text-dark dark:text-white">Operating System Distribution</h2>
              {mounted && analytics && (
                <Chart
                  options={osChartOptions}
                  series={osChartSeries}
                  type="donut"
                  height={350}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 