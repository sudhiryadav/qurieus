"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Download, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import axiosInstance from '@/lib/axios';
import { showToast } from "@/components/Common/Toast";
import { Document } from "@prisma/client";
import { formatFileSize } from "@/lib/utils";

export default function DocumentList({ onFetchDocuments }: { onFetchDocuments: (documents: Document[]) => void }) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [deleteSelectedModalOpen, setDeleteSelectedModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/documents');
      setDocuments(response.data.documents);
      setSelectedDocuments(new Set()); // Reset selections after refresh
      onFetchDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchDocuments();
    }
  }, [session?.user?.id]);

  const handleDelete = async (documentToDelete: string) => {
    setDocumentToDelete(documentToDelete);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/admin/documents/delete/${documentToDelete}`);
      if (response.status === 200) {
        setDocuments(documents.filter(doc => doc.id !== documentToDelete));
        showToast.success("Document deleted successfully");
        fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast.error("Failed to delete document");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await axiosInstance.delete('/api/admin/documents/delete-all');
      if (response.status === 200) {
        setDocuments([]);
        showToast.success("All documents deleted successfully");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting all documents:", error);
      showToast.error("Failed to delete all documents");
    } finally {
      setDeleteAllModalOpen(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const response = await axiosInstance.delete('/api/admin/documents/delete-selected', {
        data: { documentIds: Array.from(selectedDocuments) }
      });
      if (response.status === 200) {
        setDocuments(documents.filter(doc => !selectedDocuments.has(doc.id)));
        setSelectedDocuments(new Set());
        showToast.success("Selected documents deleted successfully");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting selected documents:", error);
      showToast.error("Failed to delete selected documents");
    } finally {
      setDeleteSelectedModalOpen(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
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
    } catch (error) {
      console.error('Error downloading document:', error);
      showToast.error('Failed to download document');
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)));
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
                <button
                  onClick={() => setDeleteAllModalOpen(true)}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete All
                </button>
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