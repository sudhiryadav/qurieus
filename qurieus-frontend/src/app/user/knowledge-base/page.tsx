"use client";

import { showToast } from "@/components/Common/Toast";
import DocumentList from "@/components/DocumentList";
import UploadDialog from "@/components/UploadDialog";
import { formatFileSize } from "@/lib/utils";
import { Document } from "@prisma/client";
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Upload } from "lucide-react";

export default function KnowledgeBase() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { subscriptionPlan } = useSubscription();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [remainingFiles, setRemainingFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [remainingSize, setRemainingSize] = useState(0);

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

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Upload className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Knowledge Base
          </h1>
        </div>
        <button
          onClick={() => setIsUploadDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Upload Documents
        </button>
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-300 max-w-2xl">
        Welcome to your Knowledge Base! Here you can securely upload, organize, and manage documents that power your workspace. Accepted file types include PDFs, Word documents, and text files. Use this space to store research, manuals, policies, or any reference material your team needs. Uploaded documents will be available for search and AI-powered insights. To get started, click &quot;Upload Documents&quot; and select your files. You can track your storage and file limits below.
      </p>

      <div className="mb-4 flex flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
        <p>Allowed Files: {totalFiles}</p>
        <p>Remaining Files: {remainingFiles}</p>
        <p>Allowed Size: {formatFileSize(totalSize)}</p>
        <p>Remaining Size: {formatFileSize(remainingSize)}</p>
      </div>

      <DocumentList key={refreshKey} onFetchDocuments={setDocuments} />

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
