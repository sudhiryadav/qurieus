"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

// Convert MB to bytes (1MB = 1024 * 1024 bytes)
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB size limit`);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file size before upload
      validateFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      toast.success("File uploaded successfully");
      onUploadSuccess?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload file");
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file);
      handleUpload(file);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      validateFile(file);
      handleUpload(file);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 bg-white hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="mb-3 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDF, DOC, DOCX (MAX. {MAX_FILE_SIZE_MB}MB)
          </p>
        </div>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".pdf,.doc,.docx"
        />
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {uploading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
} 