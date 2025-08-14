"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadAxiosInstance } from '@/lib/axios';

interface ProcessingStatus {
  status: string;
  details?: string;
  error?: string;
  progress?: number;
  timestamp?: string;
}

interface DocumentProgressTrackerProps {
  documentId: string;
  aiDocumentId: string;
  filename: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export default function DocumentProgressTracker({
  aiDocumentId,
  onComplete,
  onError,
}: DocumentProgressTrackerProps) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await uploadAxiosInstance.get(`/api/documents/status/${aiDocumentId}`);
        const currentStatus = (response as { data: { document: ProcessingStatus } }).data.document;

        setStatus(currentStatus);

        // Stop polling if processing is complete, failed, or not found (likely completed)
        if (
          currentStatus.status === "PROCESSED" ||
          currentStatus.status === "FAILED" ||
          currentStatus.status === "NOT_FOUND"
        ) {
          setIsPolling(false);

          if (currentStatus.status === "PROCESSED") {
            onComplete?.();
          } else if (currentStatus.status === "FAILED") {
            onError?.(currentStatus.error || "Processing failed");
          } else if (currentStatus.status === "NOT_FOUND") {
            // NOT_FOUND usually means processing completed and status was cleared
            onComplete?.();
          }
        }
      } catch (error) {
        console.error("Error polling document status:", error);
        // Continue polling even if there's an error
      }
    };

    // Start polling immediately
    pollStatus();

    // Set up polling interval (every 2 seconds)
    const pollInterval = setInterval(pollStatus, 2000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [aiDocumentId, onComplete, onError]);

  if (!status) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Checking status...
        </span>
      </div>
    );
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-3">
        {status.details && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {status.details}
          </p>
        )}

        {status.status === "NOT_FOUND" && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Document processing status not found. This might be a new upload or
            the processing has completed.
          </p>
        )}

        {status.progress !== undefined && status.progress > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>Progress</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        )}

        {status.error && status.status !== "NOT_FOUND" && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              {status.error}
            </p>
          </div>
        )}

        {isPolling && status.status === "PROCESSING" && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}

        {status.timestamp && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Last updated: {new Date(status.timestamp).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

