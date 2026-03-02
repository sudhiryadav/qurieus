"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { showToast } from '@/components/Common/Toast';
import DocumentProgressTracker from './DocumentProgressTracker';
import ConfirmDelete from '../ConfirmDelete';

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

interface DocumentsListProps {
  documents: Document[];
  onRefresh: () => void;
  onDelete?: (documentId: string) => Promise<void>;
  onDownload?: (documentId: string) => void;
  onView?: (documentId: string) => void;
  canDelete?: boolean;
  /** When true (e.g. for super admin), show download button even for PROCESSING documents */
  allowDownloadWhenProcessing?: boolean;
}

export default function DocumentsList({
  documents,
  onRefresh,
  onDelete,
  onDownload,
  onView,
  canDelete = false,
  allowDownloadWhenProcessing = false
}: DocumentsListProps) {
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deletingDocuments, setDeletingDocuments] = useState<Set<string>>(new Set());

  // Check if any documents are still processing
  useEffect(() => {
    const processingDocs = documents.filter(doc => 
      doc.status === 'PROCESSING' && doc.aiDocumentId
    );
    
    if (processingDocs.length > 0) {
      const processingIds = new Set(processingDocs.map(doc => doc.aiDocumentId!));
      setProcessingDocuments(processingIds);
    } else {
      setProcessingDocuments(new Set());
    }
  }, [documents]);

  // Clean up deleting state when documents change (e.g., after deletion)
  useEffect(() => {
    const currentDocumentIds = new Set(documents.map(doc => doc.id));
    setDeletingDocuments(prev => {
      const newSet = new Set(prev);
      // Remove loading state for documents that no longer exist
      Array.from(prev).forEach(deletingId => {
        if (!currentDocumentIds.has(deletingId)) {
          newSet.delete(deletingId);
        }
      });
      return newSet;
    });
  }, [documents]);

  // Poll status for any documents stuck in PROCESSING (e.g. after backend restart)
  // so the status API can unstick them (NOT_FOUND → mark PROCESSED) and we refresh
  useEffect(() => {
    const processingDocs = documents.filter(
      (doc) => doc.status === 'PROCESSING' && doc.aiDocumentId
    );
    if (processingDocs.length === 0) return;

    const poll = async () => {
      for (const doc of processingDocs) {
        try {
          const res = await fetch(`/api/documents/status/${doc.aiDocumentId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.document?.status === 'PROCESSED' || data?.document?.status === 'FAILED') {
              onRefresh();
              return;
            }
          }
        } catch {
          // ignore; will retry on next interval
        }
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [documents, onRefresh]);

  const handleComplete = useCallback((aiDocumentId: string) => {
    setProcessingDocuments(prev => {
      const newSet = new Set(prev);
      newSet.delete(aiDocumentId);
      return newSet;
    });
    onRefresh();
    // Don't show duplicate success message - the UploadDialog already shows it
  }, [onRefresh]);

  const handleError = useCallback((aiDocumentId: string, error: string) => {
    setProcessingDocuments(prev => {
      const newSet = new Set(prev);
      newSet.delete(aiDocumentId);
      return newSet;
    });
    showToast.error(`Processing failed: ${error}`);
  }, []);

  const handleDeleteClick = useCallback((document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
        
    console.log('🔴 DocumentsList: Delete confirm clicked for document:', documentToDelete?.id);
    if (documentToDelete && onDelete) {
      // Set loading state for the document being deleted
      setDeletingDocuments(prev => new Set(prev).add(documentToDelete.id));
      console.log('⏳ DocumentsList: Loading state set for document:', documentToDelete.id);
      
      try {
        console.log('📞 DocumentsList: Calling onDelete function');
        await onDelete(documentToDelete.id);
        console.log('✅ DocumentsList: onDelete completed successfully');
        // Remove loading state after successful deletion
        setDeletingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(documentToDelete.id);
          return newSet;
        });
        console.log('🔄 DocumentsList: Loading state removed');
      } catch (error) {
        console.error('❌ DocumentsList: Delete error:', error);
        // Remove loading state on error
        setDeletingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(documentToDelete.id);
          return newSet;
        });
        // Show error toast
        showToast.error('Failed to delete document. Please try again.');
      }
    } else {
      console.log('⚠️ DocumentsList: No document to delete or onDelete function');
    }
  }, [documentToDelete, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  }, []);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("doc")) return "📝";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      PROCESSING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      PROCESSED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      ARCHIVED: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    };
    
    return (
      <Badge
        variant="secondary"
        className={`${statusConfig[status as keyof typeof statusConfig] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      PETITION: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200",
      EVIDENCE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-200",
      CONTRACT: "bg-violet-100 text-violet-800 dark:bg-violet-700 dark:text-violet-200",
      AGREEMENT: "bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-200",
      REPORT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-200",
      GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    
    return (
      <Badge
        variant="secondary"
        className={`${categoryConfig[category as keyof typeof categoryConfig] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
      >
        {category?.replace("_", " ") || "General"}
      </Badge>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No documents found
        </h3>
        <p className="text-muted-foreground">
          Get started by uploading your first document
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 shrink-0 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center text-base">
                {getFileIcon(doc.fileType)}
              </div>
              <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 min-w-0">
                {doc.title}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getCategoryBadge(doc.category || 'GENERAL')}
              {getStatusBadge(doc.status || 'DRAFT')}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* File Size */}
            <p className="text-sm text-muted-foreground">
              {formatFileSize(doc.fileSize)}
            </p>

            {/* Description */}
            {doc.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doc.description}
              </p>
            )}

            {/* Document Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Uploaded {formatDate(doc.createdAt)}</span>
              </div>

              {doc.user && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by {doc.user.name}</span>
                </div>
              )}
            </div>

            {/* Progress Tracking */}
            {doc.aiDocumentId && doc.status === 'PROCESSING' && (
              <div className="mb-4">
                <DocumentProgressTracker
                  documentId={doc.id}
                  aiDocumentId={doc.aiDocumentId}
                  filename={doc.title}
                  onComplete={() => handleComplete(doc.aiDocumentId!)}
                  onError={(error) => handleError(doc.aiDocumentId!, error)}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(doc.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Show download: always when not processing; when processing, only if allowDownloadWhenProcessing (e.g. super admin) */}
                {onDownload && (doc.status !== 'PROCESSING' || allowDownloadWhenProcessing) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(doc.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Delete: allowed for all documents; for PROCESSING this reverts upload and removes Qdrant refs */}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(doc)}
                    disabled={deletingDocuments.has(doc.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    title={doc.status === 'PROCESSING' ? 'Cancel and remove this document (reverts upload and removes any vectors)' : 'Delete document'}
                  >
                    {deletingDocuments.has(doc.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
                
                {/* Show processing indicator when document is processing */}
                {doc.status === 'PROCESSING' && (
                  <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDelete
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={documentToDelete?.status === 'PROCESSING' ? 'Cancel & remove document' : 'Delete Document'}
        message={documentToDelete?.status === 'PROCESSING'
          ? `This will revert the upload and remove "${documentToDelete?.title}" and any related data (including vectors in the knowledge base). This cannot be undone.`
          : `Are you sure you want to delete "${documentToDelete?.title}"? This action cannot be undone.`}
        confirmText={documentToDelete?.status === 'PROCESSING' ? 'Remove' : 'Delete'}
        cancelText="Cancel"
      />
    </div>
  );
}
