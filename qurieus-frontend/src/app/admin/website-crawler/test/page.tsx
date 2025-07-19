"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";

export default function WebsiteCrawlerTestPage() {
  const [url, setUrl] = useState("https://example.com");
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState("");

  const testCrawler = async () => {
    if (!url.trim()) {
      showToast.error("Please enter a URL");
      return;
    }

    setIsTesting(true);
    setResult("");

    try {
      const response = await axiosInstance.post("/api/admin/website-crawler/start", {
        url: url.trim(),
        settings: {
          maxDepth: 1,
          maxPages: 5,
          includeImages: false,
          includeLinks: true,
          respectRobotsTxt: true,
          delay: 1000
        }
      });

      const job = response.data;
      showToast.success(`Started crawling job: ${job.id}`);

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axiosInstance.get(`/api/admin/website-crawler/status/${job.id}`);
          const jobStatus = statusResponse.data;

          if (jobStatus.status === 'completed') {
            clearInterval(pollInterval);
            setIsTesting(false);
            setResult(jobStatus.extractedContent);
            showToast.success("Crawling completed!");
          } else if (jobStatus.status === 'failed') {
            clearInterval(pollInterval);
            setIsTesting(false);
            showToast.error(`Crawling failed: ${jobStatus.error}`);
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsTesting(false);
          showToast.error("Error checking status");
        }
      }, 2000);

    } catch (error: any) {
      setIsTesting(false);
      showToast.error(error.response?.data?.error || "Failed to start crawling");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Website Crawler Test</h1>
        <p className="text-gray-600 mt-2">
          Test the website crawler functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Enter a URL to test the crawler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isTesting}
              className="flex-1"
            />
            <Button
              onClick={testCrawler}
              disabled={isTesting || !url.trim()}
            >
              {isTesting ? "Testing..." : "Test Crawler"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Crawled Content</CardTitle>
            <CardDescription>
              Content extracted from the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={result}
              readOnly
              className="min-h-[400px] font-mono text-sm w-full p-3 border rounded-md bg-gray-50"
              placeholder="Crawled content will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 