'use client';

import DocumentList from "@/components/DocumentList";
import UploadDialog from "@/components/UploadDialog";
import { useState } from "react";

export default function KnowledgeBase() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Knowledge Base</h1>
        <button
          onClick={() => setIsUploadDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Upload Documents
        </button>
      </div>

      <DocumentList key={refreshKey} />

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
} 