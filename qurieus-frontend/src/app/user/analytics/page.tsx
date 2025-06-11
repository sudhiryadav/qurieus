"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "@/lib/axios";

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalyticsData {
  totalDocuments: number;
  totalQueries: number;
  averageResponseTime: number;
  queriesByDay: {
    date: string;
    count: number;
  }[];
}

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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
        const { data } = await axios.get(`/api/admin/analytics?timeRange=${timeRange}`);
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [timeRange, status, router]);

  // Show loading state while checking authentication
  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
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
      categories: analytics?.queriesByDay?.map(item => item.date) || [],
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
      data: analytics?.queriesByDay?.map(item => item.count) || [],
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
      categories: analytics?.queriesByDay?.map(item => item.date) || [],
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
      data: analytics?.queriesByDay?.map(item => item.count) || [],
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
    labels: analytics?.queriesByDay?.map(item => item.date) || [],
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

  const deviceChartSeries = analytics?.queriesByDay?.map(item => item.count) || [];

  // Chart options for browser stats
  const browserChartOptions = {
    chart: {
      type: "donut" as const,
      toolbar: {
        show: false,
      },
    },
    labels: analytics?.queriesByDay?.map(item => item.date) || [],
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

  const browserChartSeries = analytics?.queriesByDay?.map(item => item.count) || [];

  // Chart options for OS stats
  const osChartOptions = {
    chart: {
      type: "donut" as const,
      toolbar: {
        show: false,
      },
    },
    labels: analytics?.queriesByDay?.map(item => item.date) || [],
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

  const osChartSeries = analytics?.queriesByDay?.map(item => item.count) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Total Documents
          </h3>
          <p className="text-3xl font-bold">{analytics?.totalDocuments || 0}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Total Queries
          </h3>
          <p className="text-3xl font-bold">{analytics?.totalQueries || 0}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Average Response Time
          </h3>
          <p className="text-3xl font-bold">
            {analytics?.averageResponseTime?.toFixed(2) || 0}s
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Queries Over Time</h2>
        <div className="h-64">
          {mounted && analytics && (
            <Chart
              options={timeSeriesOptions}
              series={timeSeriesSeries}
              type="area"
              height={350}
            />
          )}
        </div>
      </div>
    </div>
  );
} 