"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  "General",
  "Research",
  "Finance",
  "Legal",
  "Technical",
  "Other",
];

export default function UploadDialog({ isOpen, onClose, onUploadSuccess }: UploadDialogProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setFiles([]);
    setDescription("");
    setCategory("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });
      formData.append("description", description);
      formData.append("category", category);
      formData.append("userId", session?.user?.id || "");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload files");
      }
      toast.success("Files uploaded successfully");
      onUploadSuccess();
      onClose();
      handleReset();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload files");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-[#232a36] p-6">
        {/* Guidelines */}
        <div className="mb-6 rounded-lg bg-[#2d3543] p-5 text-white">
          <h3 className="mb-2 text-lg font-semibold">Guidelines</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Supported formats: PDF, DOCX, TXT, CSV, MD</li>
            <li>Maximum file size: {process.env.NEXT_PUBLIC_MAX_FILE_SIZE}MB per file</li>
            <li>Files will be processed and made available for searching</li>
            <li>Provide clear descriptions to improve searchability</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Upload Files */}
          <div>
            <label className="mb-2 block text-base font-semibold text-white">Upload Files</label>
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-500 bg-[#2d3543] py-8 cursor-pointer transition hover:border-primary"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 0l-4 4m4-4l4 4m-8 4h8" />
              </svg>
              <span className="text-blue-400 font-medium underline">Upload files</span> or drag and drop
              <div className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, CSV, MD up to 10MB each</div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {files.length > 0 && (
                <div className="mt-3 text-xs text-gray-200">
                  {files.map(file => (
                    <div key={file.name}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Category Dropdown */}
          <div>
            <label className="mb-2 block text-base font-semibold text-white">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-[#232a36] p-2 text-white focus:border-primary focus:outline-none"
              required
            >
              <option value="" disabled>Select a category</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Description */}
          <div>
            <label className="mb-2 block text-base font-semibold text-white">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-[#393f4a] p-2 text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              rows={3}
              placeholder="Provide a brief description of the uploaded files"
              required
            />
          </div>
          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-500 px-4 py-2 text-sm font-medium text-white bg-[#2d3543] hover:bg-[#393f4a]"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 