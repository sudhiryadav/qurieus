import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ProgressToastProps {
  documentId: string;
  filename: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface DocumentStatus {
  status: string;
  progress: number;
  details: string;
  error?: string;
}

const ProgressToast: React.FC<ProgressToastProps> = ({
  documentId,
  filename,
  onComplete,
  onError,
}) => {
  const [status, setStatus] = useState<DocumentStatus>({
    status: 'PROCESSING',
    progress: 0,
    details: 'Starting document processing...',
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/documents/status/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          const newStatus: DocumentStatus = {
            status: data.processing_status || data.status?.status || 'UNKNOWN',
            progress: data.progress || data.status?.progress || 0,
            details: data.details || data.status?.details || '',
            error: data.error || data.status?.error,
          };

          setStatus(newStatus);

          // Check if processing is complete or has error
          if (newStatus.status === 'COMPLETED') {
            console.log('ProgressToast: Document processing completed', { documentId, filename });
            onComplete?.();
            // Don't dismiss the toast automatically - let it stay visible
          } else if (newStatus.status === 'ERROR' || newStatus.error) {
            console.log('ProgressToast: Document processing error', { documentId, filename, error: newStatus.error });
            onError?.(newStatus.error || 'Processing failed');
            // Don't dismiss the toast automatically - let it stay visible
          }
        }
      } catch (error) {
        console.error('Error checking document status:', error);
      }
    };

    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000);

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, [documentId, filename, onComplete, onError]);

  const getProgressColor = () => {
    if (status.status === 'ERROR' || status.error) return 'bg-red-500';
    if (status.status === 'COMPLETED') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (status.status === 'ERROR' || status.error) return '❌';
    if (status.status === 'COMPLETED') return '✅';
    if (status.status === 'PROCESSING') return '⏳';
    return '📄';
  };

  return (
    <div className="flex flex-col space-y-2 min-w-[300px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{getStatusIcon()}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {filename}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {status.progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${status.progress}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {status.details}
      </div>
      
      {status.error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Error: {status.error}
        </div>
      )}
      
      {status.status === 'COMPLETED' && (
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
          ✅ Processing completed successfully!
        </div>
      )}
    </div>
  );
};

export default ProgressToast;
