"use client";

import axiosInstance from "@/lib/axios";
import { FileText, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import ModalDialog from "../ui/ModalDialog";
import { showToast } from "@/components/Common/Toast";

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

const MAX_FILES_PER_UPLOAD = 5;
const MAX_FILE_SIZE_BYTES = (Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 10) * 1024 * 1024; // Default 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
const ALLOWED_EXTENSIONS_DISPLAY = "PDF, DOC, DOCX, TXT, CSV, MD, XLS, XLSX";

interface SelectedFile {
  file: File;
  error?: string;
  id: string;
}

export default function UploadDialog({ isOpen, onClose, onUploadSuccess }: UploadDialogProps) {
  const { data: session } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = session?.user?.role?.toLowerCase() === "super_admin";


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndSetFiles = (files: FileList | File[]) => {
    const newFilesArray = Array.from(files);
    let currentValidationErrors: string[] = [];

    if (!isSuperAdmin && selectedFiles.length + newFilesArray.length > MAX_FILES_PER_UPLOAD) {
      showToast.error(`Cannot add more files. Maximum ${MAX_FILES_PER_UPLOAD} files allowed.`);
      return;
    }
    
    const filesToAdd: SelectedFile[] = [];

    newFilesArray.forEach((file) => {
      let errorMsg: string | undefined = undefined;
      
      // Check for duplicates
      if (selectedFiles.some(sf => sf.file.name === file.name) || 
          filesToAdd.some(nf => nf.file.name === file.name)) {
        errorMsg = `File "${file.name}" is already selected.`;
      }
      // Check file size (only for non-super-admin users)
      else if (!isSuperAdmin && file.size > MAX_FILE_SIZE_BYTES) {
        errorMsg = `File "${file.name}" (${formatFileSize(file.size)}) exceeds the ${formatFileSize(MAX_FILE_SIZE_BYTES)} size limit.`;
      }
      // Check file type
      else if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errorMsg = `File "${file.name}" has an invalid type. Allowed types: ${ALLOWED_EXTENSIONS_DISPLAY}.`;
      }
      
      if(errorMsg) {
        currentValidationErrors.push(errorMsg);
        filesToAdd.push({ file, error: errorMsg, id: file.name + Date.now() });
      } else {
        filesToAdd.push({ file, id: file.name + Date.now() });
      }
    });

    setSelectedFiles(prev => [...prev, ...filesToAdd]);

    if (currentValidationErrors.length > 0) {
      const firstError = currentValidationErrors[0];
      showToast.error(firstError);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndSetFiles(e.target.files);
      // Reset input to allow selecting the same file again if removed
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      validateAndSetFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setDescription("");
    setCategory("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validFiles = selectedFiles.filter(f => !f.error);

    if (validFiles.length === 0) {
      showToast.error("Please select at least one valid file to upload");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(sf => {
        formData.append("files", sf.file);
      });
      formData.append("description", description);
      formData.append("category", category);
      formData.append("userId", session?.user?.id || "");
      const { data } = await axiosInstance.post('/api/admin/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if(process.env.USE_MODAL_PERSISTENT_STORAGE === 'true'){
        const successCount = data.results.filter((result: any) => result.success).length;
        const errorResults = data.results.filter((result: any) => !result.success);
        const errorCount = errorResults.length;

        if (successCount > 0 && errorCount === 0) {
          showToast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
          onUploadSuccess();
          onClose();
          handleReset();
        } else if (successCount > 0 && errorCount > 0) {
          showToast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}, ${errorCount} failed`);
          showToast.error(
            `Failed to upload: ${errorResults.map((r: any) => `${r.filename}: ${r.error || 'Unknown error'}`).join('; ')}`
          );
          onUploadSuccess();
          onClose();
          handleReset();
        } else if (errorCount > 0) {
          showToast.error(
            `Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}: ${errorResults.map((r: any) => `${r.filename}: ${r.error || 'Unknown error'}`).join('; ')}`
          );
          handleReset();
        }
      } 
      else if (data.results?.[0]?.success) {
        showToast.success("All files uploaded successfully");
        onUploadSuccess();
        onClose();
        handleReset();
      } else {
        showToast.error(data.error || "Upload completed with unclear results");
        handleReset();
      }
    } catch (error: any) {
      console.error("Upload error details:", error);
      showToast.error(error.response?.data?.error || error.message || "Failed to upload files");
      handleReset();
    } finally {
      setLoading(false);
    }
  };

  // Footer buttons
  const footer = (
    <>
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
        form="upload-form"
        disabled={loading || selectedFiles.length === 0 || selectedFiles.some(f => f.error)}
        className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 ml-3"
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Uploading...
          </>
        ) : (
          `Upload ${selectedFiles.filter(f => !f.error).length} File${selectedFiles.filter(f => !f.error).length !== 1 ? 's' : ''}`
        )}
      </button>
    </>
  );

  // Header
  const header = (
    <span>Upload Files</span>
  );

  if (!isOpen) return null;

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} header={header} footer={footer}>
      <form id="upload-form" onSubmit={handleSubmit} className="space-y-5 p-5">
        {/* Guidelines */}
        <div className="mb-6 rounded-lg bg-[#2d3543] p-5 text-white">
          <h3 className="mb-2 text-lg font-semibold">Guidelines</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Supported formats: {ALLOWED_EXTENSIONS_DISPLAY}</li>
            {!isSuperAdmin && (
              <>
                <li>Maximum {MAX_FILES_PER_UPLOAD} files per upload</li>
                <li>Maximum file size: {formatFileSize(MAX_FILE_SIZE_BYTES)} per file</li>
              </>
            )}
            {isSuperAdmin && (
              <>
                <li className="text-green-400">Unlimited files per upload (Super Admin)</li>
                <li className="text-green-400">No file size limit (Super Admin)</li>
              </>
            )}
            <li>Files will be processed and made available for searching</li>
          </ul>
        </div>
        {/* Upload Files */}
        <div>
          <label className="mb-2 block text-base font-semibold text-white">Upload Files</label>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-500 bg-[#2d3543] py-8 transition hover:border-primary ${
              !isSuperAdmin && selectedFiles.length >= MAX_FILES_PER_UPLOAD ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
            onDrop={(!isSuperAdmin && selectedFiles.length >= MAX_FILES_PER_UPLOAD) ? undefined : handleDrop}
            onDragOver={handleDragOver}
            onClick={() => (!isSuperAdmin && selectedFiles.length >= MAX_FILES_PER_UPLOAD) ? undefined : fileInputRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 0l-4 4m4-4l4 4m-8 4h8" />
            </svg>
            <span className="text-blue-400 font-medium underline">Upload files</span> or drag and drop
            <span className="text-sm text-gray-400 mt-2">
              {isSuperAdmin ? "Unlimited files allowed" : `Maximum ${MAX_FILES_PER_UPLOAD} files`}
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept={ALLOWED_MIME_TYPES.join(",")}
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <label className="block text-base font-semibold text-white">Selected Files</label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedFiles.map((sf) => (
                <div
                  key={sf.id}
                  className={`flex items-center justify-between rounded-lg bg-[#2d3543] p-3 ${
                    sf.error ? "border border-red-500" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-white">{sf.file.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(sf.file.size)}
                      </p>
                      {sf.error && (
                        <p className="text-xs text-red-400 mt-1">{sf.error}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(sf.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="hidden">
          <label htmlFor="description" className="mb-2 block text-base font-semibold text-white">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg bg-[#2d3543] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter a description for the uploaded files..."
            rows={3}
          />
        </div>

        {/* Category */}
        <div className="hidden">
          <label htmlFor="category" className="mb-2 block text-base font-semibold text-white">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg bg-[#2d3543] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </form>
    </ModalDialog>
  );
} 