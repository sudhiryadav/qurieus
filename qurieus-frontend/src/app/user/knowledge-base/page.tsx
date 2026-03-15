"use client";

import { showToast } from "@/components/Common/Toast";
import DocumentsList from "@/components/DocumentsList";
import UploadDialog from "@/components/UploadDialog";
import { formatFileSize } from "@/lib/utils";
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
  user: {
    id: string;
    name: string;
    email: string;
  };
}
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Upload } from "lucide-react";
import axiosInstance from "@/lib/axios";
import LoadingOverlay from "@/components/Common/LoadingOverlay";

export default function KnowledgeBase() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { subscriptionPlan } = useSubscription();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);
  const [remainingFiles, setRemainingFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [remainingSize, setRemainingSize] = useState(0);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/documents");
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast.error("Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (subscriptionPlan) {
      setTotalFiles(subscriptionPlan.maxDocs ?? 0);
      setRemainingFiles(
        subscriptionPlan.maxDocs
          ? subscriptionPlan.maxDocs - documents.length
          : 0,
      );
      setTotalSize(
        subscriptionPlan.maxStorageMB
          ? subscriptionPlan.maxStorageMB * 1024 * 1024
          : 0,
      );
      setRemainingSize(
        subscriptionPlan.maxStorageMB
          ? subscriptionPlan.maxStorageMB * 1024 * 1024 -
              documents.reduce((acc, doc) => acc + doc.fileSize, 0)
          : 0,
      );
    }
  }, [documents, subscriptionPlan]);

  const handleUploadSuccess = () => {
    fetchDocuments(); // Refresh the document list
  };

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Upload className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Knowledge Base
          </h1>
        </div>
        {documents.length > 0 && (
          <button
            onClick={() => setIsUploadDialogOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Upload Documents
          </button>
        )}
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Welcome to your Knowledge Base! Here you can securely upload, organize, and manage documents that power your workspace. Accepted file types include PDFs, Word documents, and text files. Use this space to store research, manuals, policies, or any reference material your team needs. Uploaded documents will be available for search and AI-powered insights. To get started, click &quot;Upload Documents&quot; and select your files. You can track your storage and file limits below.
      </p>

      <div className="mb-4 flex flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
        <p>Allowed Files: {totalFiles}</p>
        <p>Remaining Files: {remainingFiles}</p>
        <p>Allowed Size: {formatFileSize(totalSize)}</p>
        <p>Remaining Size: {formatFileSize(remainingSize)}</p>
      </div>

      {/* Documents List */}
      <div className="relative">
        <LoadingOverlay loading={loading} htmlText="Loading documents..." position="absolute" />
        <DocumentsList
          documents={documents}
          onRefresh={fetchDocuments}
          onUploadClick={documents.length === 0 ? () => setIsUploadDialogOpen(true) : undefined}
          onDownload={async (documentId: string) => {
            try {
              const response = await axiosInstance.get(`/api/documents/${documentId}/download`, {
                responseType: 'blob'
              });
              const blob = new Blob([response.data]);
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'document';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              showToast.success('Download started');
            } catch (error) {
              console.error("Error downloading document:", error);
              showToast.error("Failed to download document");
            }
          }}
          onDelete={async (documentId: string) => {
            console.log('🗑️ KnowledgeBase: onDelete called for document:', documentId);
            try {
              console.log('📡 KnowledgeBase: Making DELETE request to API');
              await axiosInstance.delete(`/api/documents/${documentId}`);
              console.log('✅ KnowledgeBase: DELETE request successful');
              showToast.success('Document deleted successfully');
              fetchDocuments(); // Refresh the list
            } catch (error) {
              console.error("❌ KnowledgeBase: Error deleting document:", error);
              showToast.error("Failed to delete document");
            }
          }}
          canDelete={true}
        />
      </div>

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        customUploadEndpoint="/api/documents/upload"
      />
    </div>
  );
}
