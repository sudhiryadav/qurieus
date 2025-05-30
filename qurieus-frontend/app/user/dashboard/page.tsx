"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Wait until component is mounted to render charts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample chart options
  const chartOptions = {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
      foreColor: "#64748b", // Base text color
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    colors: ["#3758F9"], // Primary color
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
      borderColor: "#f1f5f9", // Light gray
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
    },
  };

  const chartSeries = [
    {
      name: "Document Views",
      data: [30, 40, 35, 50, 49, 60, 70],
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
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
    colors: ["#10b981", "#3758F9", "#f59e0b"], // Green, Blue, Amber
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
      name: "AI ChatBot",
      data: [31, 40, 28, 51],
    },
    {
      name: "Knowledge Base",
      data: [11, 32, 45, 32],
    },
    {
      name: "Document Search",
      data: [15, 11, 32, 18],
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">
        Welcome, {session?.user?.name}!
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Documents</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">24</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Chat Conversations</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">134</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Knowledge Base Views</h2>
          <p className="text-3xl font-bold text-dark dark:text-white">2.4k</p>
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
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Activity</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-dark-3">
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Today 10:32 AM</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Document Upload</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Product Manual v2.0</td>
              </tr>
              <tr className="border-b dark:border-dark-3">
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Yesterday 4:15 PM</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Chat Conversation</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">10 messages exchanged</td>
              </tr>
              <tr className="border-b dark:border-dark-3">
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Yesterday 11:20 AM</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">Knowledge Base Update</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">FAQ section updated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 