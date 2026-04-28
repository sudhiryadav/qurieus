"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { User, Upload, Download, Trash2, Search, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { showToast } from '@/components/Common/Toast';
import axiosInstance from '@/lib/axios';
import UploadDialog from '@/components/UploadDialog';
import ConfirmDelete from '@/components/ConfirmDelete';
import { format } from "date-fns";
import AsyncSelect from "react-select/async";
import { useTheme } from "next-themes";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Document {
  id: string;
  title: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category?: string;
  description?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  qdrantDocumentId?: string;
  chunkCount: number;
  isProcessed: boolean;
  processedAt?: string;
  metadata?: string;
}

interface UserOption {
  value: string;
  label: string;
  user: User;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AdminKnowledgeBasePage() {
  const { data: session } = useSession();
  const { theme, resolvedTheme } = useTheme();
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Load current user (super admin) as default selection
  useEffect(() => {
    if (session?.user) {
      setSelectedUser({
        value: session.user.id,
        label: `${session.user.name} (${session.user.email})`,
        user: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || ''
        }
      });
    }
  }, [session]);

  // Fetch documents when user selection changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserDocuments(selectedUser.user.id);
    }
  }, [selectedUser]);

  const fetchUserDocuments = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/admin/users/${userId}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      showToast.error("Failed to fetch user documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Async function to load users for react-select
  const loadUsers = useCallback(async (inputValue: string) => {
    try {
      const response = await axiosInstance.get("/api/admin/users");
      const users = response.data.users || [];
      
      return users
        .filter((user: User) => 
          user.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          user.email.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((user: User) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
          user: user
        }));
    } catch (error) {
      return [];
    }
  }, []);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    if (selectedUser) {
      fetchUserDocuments(selectedUser.user.id);
    }
  };

  const handleUserChange = (option: UserOption | null) => {
    setSelectedUser(option);
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    if (!selectedUser) return;
    
    try {
      const response = await axiosInstance.get(
        `/api/admin/users/${selectedUser.user.id}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      
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
      showToast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!selectedUser) return;
    
    // Find the document to delete
    const docToDelete = documents.find(doc => doc.id === documentId);
    if (!docToDelete) return;
    
    setDocumentToDelete(docToDelete);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setDocumentToDelete(null);

    if (!selectedUser || !documentToDelete) return;
    
    try {
      // Use the unified delete API - admin can delete any document
      await axiosInstance.delete(`/api/documents/${documentToDelete.id}`);
      
      showToast.success("Document deleted successfully");
      // Refresh the documents list
      fetchUserDocuments(selectedUser.user.id);
    } catch (error) {
      showToast.error('Failed to delete document');
    }
  };

  // React-select styles for dark mode support
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
      borderColor: state.isFocused 
        ? '#3b82f6' 
        : resolvedTheme === 'dark' ? '#374151' : '#d1d5db',
      '&:hover': {
        borderColor: '#3b82f6'
      },
      boxShadow: state.isFocused 
        ? `0 0 0 1px ${resolvedTheme === 'dark' ? '#3b82f6' : '#3b82f6'}` 
        : 'none',
      minHeight: '40px'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
          ? (resolvedTheme === 'dark' ? '#374151' : '#f3f4f6')
          : 'transparent',
      color: state.isSelected 
        ? '#ffffff' 
        : resolvedTheme === 'dark' ? '#f9fafb' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected 
          ? '#3b82f6' 
          : resolvedTheme === 'dark' ? '#4b5563' : '#f3f4f6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
      border: `1px solid ${resolvedTheme === 'dark' ? '#374151' : '#d1d5db'}`,
      borderRadius: '0.375rem',
      boxShadow: resolvedTheme === 'dark' 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#f9fafb' : '#374151'
    }),
    input: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#f9fafb' : '#374151'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280'
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '0.5rem 0'
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280'
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280'
    })
  };

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Knowledge Base Management
          </h1>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Select a user to view and manage their documents. You can upload new documents on behalf of the selected user.
        </p>

        {/* User Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select User
          </label>
          <AsyncSelect
            value={selectedUser}
            onChange={handleUserChange}
            loadOptions={loadUsers}
            placeholder="Search for a user..."
            isClearable
            isSearchable
            className="w-full max-w-md"
            classNamePrefix="react-select"
            styles={selectStyles}
          />
        </div>

        {/* Upload Button */}
        {selectedUser && (
          <div className="mb-6">
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Document for {selectedUser.user.name}
            </Button>
          </div>
        )}
      </div>

      {/* Documents Table */}
      {selectedUser && (
        <div className="bg-white dark:bg-dark-2 rounded shadow p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Documents for {selectedUser.user.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedUser.user.email}
            </p>
          </div>

          <LoadingOverlay loading={loading} htmlText="Loading documents..." position="absolute" />
          
          {!loading && documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents found for this user.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 font-medium">Document Name</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Size</th>
                    <th className="text-left py-2 font-medium">Uploaded</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Chunks</th>
                    <th className="text-left py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{doc.originalName}</div>
                        {doc.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {doc.description}
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {doc.fileType.toUpperCase()}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          doc.isProcessed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {doc.isProcessed ? 'Processed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {doc.chunkCount}
                      </td>
                      <td className="py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(doc.id, doc.originalName)}
                            className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 transition-colors"
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 transition-colors"
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
          )}
        </div>
      )}

      {/* Upload Dialog */}
      {selectedUser && (
        <UploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          customUploadEndpoint={`/api/admin/users/${selectedUser.user.id}/documents/upload`}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDelete
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.originalName}"? This action cannot be undone.`}
        isLoading={loading}
      />
    </div>
  );
} 