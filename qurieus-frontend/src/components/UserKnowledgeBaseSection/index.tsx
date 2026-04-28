"use client";

import React, { useCallback, useEffect, useState } from "react";
import DocumentsList from "@/components/DocumentsList";
import DocumentUpload from "@/components/DocumentUpload";
import Loader from "@/components/Common/Loader";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category?: string;
  fileUrl?: string;
  aiDocumentId?: string;
  status?: string;
  qdrantDocumentId?: string;
  chunkCount: number;
  isProcessed: boolean;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface UserKnowledgeBaseSectionProps {
  userId: string;
  userName: string;
  /** Admin uploading on behalf of user - enables delete, uses admin endpoints */
  isAdminView?: boolean;
  onDocumentsChange?: () => void;
  /** Compact mode for embedding in modals */
  compact?: boolean;
  /** When true (e.g. for super admin), allow download even for PROCESSING documents */
  allowDownloadWhenProcessing?: boolean;
}

export default function UserKnowledgeBaseSection({
  userId,
  userName,
  isAdminView = false,
  onDocumentsChange,
  compact = false,
  allowDownloadWhenProcessing = false,
}: UserKnowledgeBaseSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/users/${userId}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      showToast.error("Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchDocuments();
  }, [userId, fetchDocuments]);

  const handleUploadComplete = useCallback(() => {
    fetchDocuments();
    onDocumentsChange?.();
  }, [fetchDocuments, onDocumentsChange]);

  const uploadEndpoint = `/api/admin/users/${userId}/documents/upload`;

  return (
    <div className={`space-y-4 ${compact ? "max-h-[400px] overflow-y-auto" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">
          Knowledge Base - {userName}
        </h3>
      </div>

      {/* Inline upload area */}
      <DocumentUpload
        customUploadEndpoint={uploadEndpoint}
        onUploadComplete={handleUploadComplete}
        maxFiles={5}
        maxSize={20 * 1024 * 1024}
        accept={{
          "application/pdf": [".pdf"],
          "application/msword": [".doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
          "text/plain": [".txt"],
          "text/csv": [".csv"],
          "application/vnd.ms-excel": [".xls"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        }}
        className="mb-4"
      />

      {/* Documents list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No documents yet. Upload files above to add them to this user&apos;s knowledge base.
        </p>
      ) : (
        <DocumentsList
          documents={documents}
          onRefresh={handleUploadComplete}
          allowDownloadWhenProcessing={allowDownloadWhenProcessing}
          onDelete={
            isAdminView
              ? async (documentId: string) => {
                  try {
                    await axiosInstance.delete(`/api/documents/${documentId}`);
                    handleUploadComplete();
                    showToast.success("Document deleted");
                  } catch (error) {
                    showToast.error("Failed to delete document");
                  }
                }
              : undefined
          }
          onDownload={async (documentId: string) => {
            try {
              const response = await axiosInstance.get(
                `/api/admin/users/${userId}/documents/${documentId}/download`,
                { responseType: "blob" }
              );
              const blob = new Blob([response.data]);
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "document";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              showToast.success("Download started");
            } catch (error) {
              showToast.error("Failed to download");
            }
          }}
          canDelete={isAdminView}
        />
      )}
    </div>
  );
}
