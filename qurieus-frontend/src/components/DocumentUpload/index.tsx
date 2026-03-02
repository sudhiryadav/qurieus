"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { showToast } from '@/components/Common/Toast';
import { uploadAxiosInstance } from '@/lib/axios';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  documentId?: string;
  aiDocumentId?: string;
  error?: string;
}

interface DocumentUploadProps {
  onUploadComplete?: (document: any) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
  /** Custom upload endpoint (e.g. for admin uploading on behalf of a user) */
  customUploadEndpoint?: string;
}

export default function DocumentUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxSize = 20 * 1024 * 1024, // 20MB
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
  },
  disabled = false,
  className = "",
  customUploadEndpoint,
}: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const monitorProcessingStatus = useCallback(async (documentId: string, aiDocumentId: string, fileId: string) => {
    if (!aiDocumentId) return;

    const checkStatus = async () => {
      try {
        const response = await uploadAxiosInstance.get(`/api/documents/status/${aiDocumentId}`);
        
        if (response.data.success) {
          const document = response.data.document;
          
          if (document.processingStatus === 'PROCESSED') {
            // Processing completed
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'completed', progress: 100 }
                  : f
              )
            );

            // Don't show duplicate success message - the UploadDialog already shows it
            onUploadComplete?.(document);
            return true; // Stop monitoring
          } else if (document.processingStatus === 'FAILED') {
            // Processing failed
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'error', error: 'Processing failed' }
                  : f
              )
            );

            showToast.error(`Document processing failed!`);
            onUploadError?.('Document processing failed');
            return true; // Stop monitoring
          }
        }
        
        return false; // Continue monitoring
      } catch (error) {
        console.error('Status check error:', error);
        return false; // Continue monitoring
      }
    };

    // Check status every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Stop monitoring after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      // Check if still processing and mark as timeout
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId && f.status === 'processing'
            ? { ...f, status: 'error', error: 'Processing timeout' }
            : f
        )
      );
    }, 5 * 60 * 1000);
  }, [onUploadComplete, onUploadError]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    // Upload each file
    for (const file of acceptedFiles) {
      const fileId = newFiles.find(f => f.name === file.name)?.id;
      if (!fileId) continue;

      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('description', '');
        formData.append('category', 'General');

        // Update status to uploading
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'uploading', progress: 0 }
              : f
          )
        );

        // Upload file
        const uploadUrl = customUploadEndpoint || '/api/documents/upload';
        const response = await uploadAxiosInstance.post(uploadUrl, formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.id === fileId 
                    ? { ...f, progress }
                    : f
                )
              );
            }
          },
        });

        if (response.data.success) {
          const document = response.data.document;
          
          // Update status to processing if background processing
          if (document.processingStatus === 'PROCESSING') {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { 
                      ...f, 
                      status: 'processing', 
                      progress: 100,
                      documentId: document.id,
                      aiDocumentId: document.aiDocumentId 
                    }
                  : f
              )
            );

            // Start monitoring processing status
            monitorProcessingStatus(document.id, document.aiDocumentId, fileId);
          } else {
            // Processing completed immediately
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { 
                      ...f, 
                      status: 'completed', 
                      progress: 100,
                      documentId: document.id,
                      aiDocumentId: document.aiDocumentId 
                    }
                  : f
              )
            );

            showToast.success(`${file.name} uploaded and processed successfully!`);
            onUploadComplete?.(document);
          }
        } else {
          throw new Error(response.data.error || 'Upload failed');
        }

      } catch (error: any) {
        console.error('Upload error:', error);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: 'error', 
                  progress: 0,
                  error: error.message || 'Upload failed' 
                }
              : f
          )
        );

        showToast.error(`${file.name} upload failed: ${error.message || 'Unknown error'}`);
        onUploadError?.(error.message || 'Upload failed');
      }
    }

    setIsUploading(false);
  }, [disabled, onUploadComplete, onUploadError, monitorProcessingStatus]);



  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith("image/")) {
      return "🖼️";
    } else if (file.type === "application/pdf") {
      return "📄";
    } else if (file.type.includes("word")) {
      return "📝";
    } else if (file.type === "text/plain") {
      return "📄";
    }
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return `Uploading... ${file.progress}%`;
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return file.error || 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          or click to select files
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB each
        </p>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Uploaded Files
          </h3>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-2xl">{getFileIcon(file)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {getStatusText(file)}
                  </span>
                </div>

                {/* Progress bar for uploading */}
                {file.status === 'uploading' && (
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={file.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
