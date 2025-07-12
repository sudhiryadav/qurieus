"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Download, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import axiosInstance from '@/lib/axios';
import { showToast } from "@/components/Common/Toast";
import LoadingButton from "@/components/Common/LoadingButton";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { Document } from "@prisma/client";
import { formatFileSize } from "@/lib/utils";
import { logger } from "@/lib/logger";

export default function DocumentList({ onFetchDocuments }: { onFetchDocuments: (documents: Document[]) => void }) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [deleteSelectedModalOpen, setDeleteSelectedModalOpen] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      logger.info("DocumentList: Fetching documents");
      const response = await axiosInstance.get('/api/admin/documents');
      setDocuments(response.data.documents);
      setSelectedDocuments(new Set()); // Reset selections after refresh
      onFetchDocuments(response.data.documents);
      logger.info("DocumentList: Documents fetched successfully", { 
        documentCount: response.data.documents.length 
      });
    } catch (error) {
      logger.error('DocumentList: Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [onFetchDocuments]);

  useEffect(() => {
    if (session?.user?.id) {
      logger.info("DocumentList: Component mounted, fetching documents", { 
        userId: session.user.id 
      });
      fetchDocuments();
    }
  }, [session?.user?.id, fetchDocuments]);

  const handleDelete = async (documentToDelete: string) => {
    const document = documents.find(doc => doc.id === documentToDelete);
    logger.info("DocumentList: Delete document requested", { 
      documentId: documentToDelete,
      fileName: document?.fileName 
    });
    setDocumentToDelete(documentToDelete);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      logger.info("DocumentList: Confirming document deletion", { 
        documentId: documentToDelete 
      });
      const response = await axiosInstance.delete(`/api/admin/documents/delete/${documentToDelete}`);
      if (response.status === 200) {
        setDocuments(documents.filter(doc => doc.id !== documentToDelete));
        showToast.success("Document deleted successfully");
        logger.info("DocumentList: Document deleted successfully", { 
          documentId: documentToDelete 
        });
        fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      logger.error("DocumentList: Error deleting document:", error);
      showToast.error("Failed to delete document");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteAll = async () => {
    // Close modal immediately when action is triggered
    setDeleteAllModalOpen(false);
    
    try {
      setDeleteAllLoading(true);
      logger.info("DocumentList: Deleting all documents", { 
        documentCount: documents.length 
      });
      const response = await axiosInstance.delete('/api/admin/documents/delete-all');
      if (response.status === 200) {
        setDocuments([]);
        showToast.success("All documents deleted successfully");
        logger.info("DocumentList: All documents deleted successfully", { 
          deletedCount: documents.length 
        });
        fetchDocuments();
      }
    } catch (error) {
      logger.error("DocumentList: Error deleting all documents:", error);
      showToast.error("Failed to delete all documents");
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      logger.info("DocumentList: Deleting selected documents", { 
        selectedCount: selectedDocuments.size,
        selectedIds: Array.from(selectedDocuments) 
      });
      const response = await axiosInstance.delete('/api/admin/documents/delete-selected', {
        data: { documentIds: Array.from(selectedDocuments) }
      });
      if (response.status === 200) {
        setDocuments(documents.filter(doc => !selectedDocuments.has(doc.id)));
        setSelectedDocuments(new Set());
        showToast.success("Selected documents deleted successfully");
        logger.info("DocumentList: Selected documents deleted successfully", { 
          deletedCount: selectedDocuments.size 
        });
        fetchDocuments();
      }
    } catch (error) {
      logger.error("DocumentList: Error deleting selected documents:", error);
      showToast.error("Failed to delete selected documents");
    } finally {
      setDeleteSelectedModalOpen(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      logger.info("DocumentList: Downloading document", { 
        documentId, 
        fileName 
      });
      const response = await axiosInstance.get(`/api/admin/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      if (!response.data) throw new Error('Download failed');
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success("Document downloaded successfully");
      logger.info("DocumentList: Document downloaded successfully", { 
        documentId, 
        fileName 
      });
    } catch (error) {
      logger.error('DocumentList: Error downloading document:', error);
      showToast.error('Failed to download document');
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    const wasSelected = newSelected.has(documentId);
    if (wasSelected) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
    logger.info("DocumentList: Document selection toggled", { 
      documentId, 
      wasSelected, 
      isSelected: !wasSelected,
      totalSelected: newSelected.size 
    });
  };

  const toggleSelectAll = () => {
    const wasAllSelected = selectedDocuments.size === documents.length;
    if (wasAllSelected) {
      setSelectedDocuments(new Set());
      logger.info("DocumentList: Deselecting all documents");
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)));
      logger.info("DocumentList: Selecting all documents", { 
        documentCount: documents.length 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay loading={deleteAllLoading} htmlText="Deleting all documents..." />
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        {documents.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>No documents uploaded yet.</p>
            <p className="mt-2 text-sm">Upload your first document to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <LoadingButton
                  onClick={() => setDeleteAllModalOpen(true)}
                  loading={deleteAllLoading}
                  loadingText="Deleting..."
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete All
                </LoadingButton>
                {selectedDocuments.size > 0 && (
                  <button
                    onClick={() => setDeleteSelectedModalOpen(true)}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Delete Selected ({selectedDocuments.size})
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-dark-3">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.size === documents.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents?.map((doc) => (
                    <tr key={doc.id} className="border-b dark:border-dark-3">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(doc.id)}
                          onChange={() => toggleDocumentSelection(doc.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-dark dark:text-white">{doc.originalName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {doc.fileType.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(doc.id, doc.originalName)}
                            className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Single Document Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Document"
        confirmText="Delete"
      >
        <p>Are you sure you want to delete this document? This action cannot be undone.</p>
      </Modal>

      {/* Delete All Documents Modal */}
      <Modal
        isOpen={deleteAllModalOpen}
        onClose={() => setDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Documents"
        confirmText="Delete All"
      >
        <p>Are you sure you want to delete all documents? This action cannot be undone.</p>
      </Modal>

      {/* Delete Selected Documents Modal */}
      <Modal
        isOpen={deleteSelectedModalOpen}
        onClose={() => setDeleteSelectedModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Selected Documents"
        confirmText="Delete Selected"
      >
        <p>Are you sure you want to delete the selected documents? This action cannot be undone.</p>
      </Modal>
    </>
  );
} 