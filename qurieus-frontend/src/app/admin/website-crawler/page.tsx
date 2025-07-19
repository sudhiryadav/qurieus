'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Download, Play, Square, RotateCcw } from 'lucide-react';
import { showToast } from '@/components/Common/Toast';

interface CrawlSettings {
  maxDepth: number;
  maxPages: number;
  includeImages: boolean;
  includeLinks: boolean;
  respectRobotsTxt: boolean;
  delay: number;
  usePuppeteer: boolean;
  extractMainContent: boolean;
}

interface CrawlLog {
  message: string;
  logType: string;
  url?: string;
  timestamp: string;
}

interface StreamEvent {
  type: 'log' | 'status' | 'completed';
  jobId?: string;
  message?: string;
  logType?: string;
  url?: string;
  timestamp?: string;
  current?: number;
  total?: number;
  percentage?: number;
  results?: number;
  status?: string;
  error?: string;
}

export default function WebsiteCrawlerPage() {
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 50, percentage: 0 });
  const [extractedContent, setExtractedContent] = useState('');
  const [settings, setSettings] = useState<CrawlSettings>({
    maxDepth: 3,
    maxPages: 50,
    includeImages: false,
    includeLinks: true,
    respectRobotsTxt: true,
    delay: 1000,
    usePuppeteer: true,
    extractMainContent: true,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const startCrawl = async () => {
    if (!url.trim()) {
      showToast.error('Please enter a URL');
      return;
    }

    try {
      setIsCrawling(true);
      setLogs([]);
      setProgress({ current: 0, total: settings.maxPages, percentage: 0 });
      setExtractedContent('');
      setCurrentJobId(null);

      console.log('Starting crawl...');

      // Send the crawl request via POST
      const response = await fetch('/api/admin/website-crawler/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, settings }),
      });

      if (!response.ok) {
        throw new Error('Failed to start crawl');
      }

      const data = await response.json();
      const jobId = data.jobId;
      setCurrentJobId(jobId);
      showToast.success('Crawl job created successfully');

      // Create EventSource for Server-Sent Events
      const eventSource = new EventSource(`/api/admin/website-crawler/stream/${jobId}`);
      eventSourceRef.current = eventSource;

      console.log('EventSource created for job:', jobId);

      // Handle SSE events
      eventSource.onopen = (event) => {
        console.log('EventSource connection opened:', event);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: StreamEvent = JSON.parse(event.data);
          console.log('SSE Event received:', data);
          console.log('SSE Event data type:', typeof data);
          console.log('SSE Event data keys:', Object.keys(data));

          switch (data.type) {
            case 'log':
              if (data.message) {
                console.log('Adding log to UI:', data.message);
                // Ensure we're creating a proper log object with string values
                const newLog: CrawlLog = {
                  message: typeof data.message === 'string' ? data.message : String(data.message),
                  logType: typeof data.logType === 'string' ? data.logType : 
                           typeof data.type === 'string' ? data.type : 'info',
                  url: typeof data.url === 'string' ? data.url : undefined,
                  timestamp: typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString()
                };
                console.log('Created log object:', newLog);
                // Ensure all properties are strings before adding to state
                if (typeof newLog.message === 'string' && typeof newLog.logType === 'string' && typeof newLog.timestamp === 'string') {
                  setLogs(prev => [...prev, newLog]);
                } else {
                  console.error('Invalid log object created:', newLog);
                }
              } else if (typeof data === 'object' && data !== null) {
                // Fallback: if we receive an object without a message, try to extract info
                console.warn('Received log object without message:', data);
                const fallbackLog: CrawlLog = {
                  message: JSON.stringify(data),
                  logType: 'warning',
                  timestamp: new Date().toISOString()
                };
                setLogs(prev => [...prev, fallbackLog]);
              }
              break;

            case 'status':
              if (data.current !== undefined && data.total !== undefined) {
                console.log('Updating progress:', data.current, data.total, data.percentage);
                setProgress({
                  current: data.current,
                  total: data.total,
                  percentage: data.percentage || Math.round((data.current / data.total) * 100)
                });
              }
              break;

            case 'completed':
              setIsCrawling(false);
              eventSource.close();
              
              if (data.status === 'completed') {
                showToast.success(`Crawl completed! Extracted ${data.results || 0} pages`);
                
                // Fetch the final content
                if (data.jobId) {
                  (async () => {
                    console.log('Fetching job data for:', data.jobId);
                    const jobResponse = await fetch(`/api/admin/website-crawler/status/${data.jobId}`);
                    console.log('Job response status:', jobResponse.status);
                    if (jobResponse.ok) {
                      const jobData = await jobResponse.json();
                      console.log('Job data received:', jobData);
                      console.log('Extracted content length:', jobData.extractedContent?.length || 0);
                      setExtractedContent(jobData.extractedContent || '');
                    } else {
                      console.error('Failed to fetch job data:', jobResponse.status, jobResponse.statusText);
                    }
                  })();
                }
              } else if (data.status === 'failed') {
                showToast.error(data.error || 'Crawl failed');
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        console.error('EventSource readyState:', eventSource.readyState);
        setIsCrawling(false);
        eventSource.close();
        showToast.error('Connection lost');
      };

    } catch (error) {
      console.error('Error starting crawl:', error);
      setIsCrawling(false);
      showToast.error('Failed to start crawl');
    }
  };

  const stopCrawl = async () => {
    if (currentJobId) {
      try {
        await fetch(`/api/admin/website-crawler/stop/${currentJobId}`, {
          method: 'POST',
        });
        showToast.success('Crawl stopped');
      } catch (error) {
        showToast.error('Failed to stop crawl');
      }
    }
    
    setIsCrawling(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const downloadContent = () => {
    if (!extractedContent) {
      showToast.error('No content to download');
      return;
    }

    const blob = new Blob([extractedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crawled-content-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCrawler = () => {
    setIsCrawling(false);
    setCurrentJobId(null);
    setLogs([]);
    setProgress({ current: 0, total: 50, percentage: 0 });
    setExtractedContent('');
    setUrl('');
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Website Crawler</h1>
        <div className="flex gap-2">
          {isCrawling ? (
            <Button onClick={stopCrawl} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Stop Crawl
            </Button>
          ) : (
            <Button onClick={startCrawl} disabled={!url.trim()}>
              <Play className="w-4 h-4 mr-2" />
              Start Crawl
            </Button>
          )}
          <Button onClick={resetCrawler} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Crawl Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isCrawling}
              />
            </div>

            <div>
              <Label>Max Depth: {settings.maxDepth}</Label>
              <input
                type="range"
                min="1"
                max="5"
                value={settings.maxDepth}
                onChange={(e) => setSettings(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                disabled={isCrawling}
                className="w-full"
              />
            </div>

            <div>
              <Label>Max Pages: {settings.maxPages}</Label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={settings.maxPages}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
                disabled={isCrawling}
                className="w-full"
              />
            </div>

            <div>
              <Label>Delay (ms): {settings.delay}</Label>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={settings.delay}
                onChange={(e) => setSettings(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
                disabled={isCrawling}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="usePuppeteer"
                checked={settings.usePuppeteer}
                onChange={(e) => setSettings(prev => ({ ...prev, usePuppeteer: e.target.checked }))}
                disabled={isCrawling}
              />
              <Label htmlFor="usePuppeteer">Use Puppeteer (JavaScript-heavy sites)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="extractMainContent"
                checked={settings.extractMainContent}
                onChange={(e) => setSettings(prev => ({ ...prev, extractMainContent: e.target.checked }))}
                disabled={isCrawling}
              />
              <Label htmlFor="extractMainContent">Extract Main Content</Label>
            </div>
          </CardContent>
        </Card>

        {/* Progress and Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Progress
                <Badge variant={isCrawling ? "default" : "secondary"}>
                  {isCrawling ? "Running" : "Idle"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pages Crawled: {progress.current}</span>
                  <span>Total: {progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {progress.percentage}% Complete
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto bg-muted p-4 rounded-md font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-2">
                      <span className="text-muted-foreground">[{log.timestamp || 'Unknown'}]</span>
                      <span className={`ml-2 ${
                        (log.logType || 'info') === 'error' ? 'text-red-500' :
                        (log.logType || 'info') === 'success' ? 'text-green-500' :
                        (log.logType || 'info') === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}>
                        [{(log.logType || 'info').toUpperCase()}]
                      </span>
                      <span className="ml-2">{log.message || 'No message'}</span>
                      {log.url && (
                        <span className="ml-2 text-muted-foreground">({log.url})</span>
                      )}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Extracted Content */}
          {extractedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Extracted Content
                  <Button onClick={downloadContent} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={extractedContent}
                  readOnly
                  className="h-64 font-mono text-sm w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-800"
                  placeholder="Extracted content will appear here..."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 