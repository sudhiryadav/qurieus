"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ModalDialog from "@/components/ui/ModalDialog";
import { Search, Plus, Filter, User as UserIcon, FileText } from "lucide-react";
import { showToast } from "@/components/Common/Toast";
import Loader from "@/components/Common/Loader";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import DocumentsList from "@/components/DocumentsList";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";

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

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  company: string;
  plan: string | null;
  subscription_type: string | null;
  subscription_start_date: string;
  subscription_end_date: string;
  is_verified: boolean;
  jobTitle?: string;
  bio?: string;
  phone?: string;
  subscriptions?: Array<{
    plan: {
      name: string;
    };
  }>;
  _count?: {
    documents: number;
  };
}

const ROLE_DESCRIPTIONS = {
  USER: "Regular user with basic access",
  ADMIN: "Administrator with elevated privileges",
  SUPER_ADMIN: "Super administrator with full system access",
} as const;

const ROLE_MAPPINGS = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
} as const;

const formatRole = (role: string) => {
  return ROLE_MAPPINGS[role as keyof typeof ROLE_MAPPINGS] || role;
};

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForDocuments, setSelectedUserForDocuments] = useState<User | null>(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    plan: "",
    subscription_type: "",
    is_active: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    company: "",
    plan: null as string | null,
    subscription_type: null as string | null,
    is_verified: false,
    jobTitle: "",
    bio: "",
    phone: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast.error("Failed to fetch users");
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch("/api/admin/users", {
        id: userId,
        is_active: !currentStatus,
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ));
      
      showToast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      showToast.error("Failed to update user status");
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "", // Reset password field when editing
      role: user.role,
      company: user.company || "",
      plan: user.plan,
      subscription_type: user.subscription_type,
      is_verified: user.is_verified,
      jobTitle: user.jobTitle || "",
      bio: user.bio || "",
      phone: user.phone || "",
    });
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;

    try {
      // Clean up the form data before sending
      const cleanFormData = {
        id: editingUser.id,
        ...editForm,
        // Convert empty strings to null for optional fields
        plan: editForm.plan && editForm.plan !== '' ? editForm.plan : null,
        subscription_type: editForm.subscription_type && editForm.subscription_type !== '' ? editForm.subscription_type : null,
        company: editForm.company && editForm.company !== '' ? editForm.company : null,
        jobTitle: editForm.jobTitle && editForm.jobTitle !== '' ? editForm.jobTitle : null,
        bio: editForm.bio && editForm.bio !== '' ? editForm.bio : null,
        phone: editForm.phone && editForm.phone !== '' ? editForm.phone : null
      };

      await axiosInstance.patch("/api/admin/users", cleanFormData);
      
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editForm }
          : user
      ));
      
      setEditingUser(null);
      showToast.success("User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.error || "Failed to update user";
      showToast.error(errorMessage);
    }
  };

  const handleAddUser = async () => {
    // Validate required fields
    if (!editForm.name || !editForm.email || !editForm.password) {
      showToast.error("Name, email, and password are required");
      return;
    }

    try {
      // Clean up the form data before sending
      const cleanFormData = {
        ...editForm,
        // Convert empty strings to null for optional fields
        plan: editForm.plan && editForm.plan !== '' ? editForm.plan : null,
        subscription_type: editForm.subscription_type && editForm.subscription_type !== '' ? editForm.subscription_type : null,
        company: editForm.company && editForm.company !== '' ? editForm.company : null,
        jobTitle: editForm.jobTitle && editForm.jobTitle !== '' ? editForm.jobTitle : null,
        bio: editForm.bio && editForm.bio !== '' ? editForm.bio : null,
        phone: editForm.phone && editForm.phone !== '' ? editForm.phone : null
      };

      const response = await axiosInstance.post("/api/admin/users", cleanFormData);
      
      setUsers([response.data, ...users]);
      setIsAddModalOpen(false);
      setEditForm({
        name: "",
        email: "",
        password: "",
        role: "",
        company: "",
        plan: null,
        subscription_type: null,
        is_verified: false,
        jobTitle: "",
        bio: "",
        phone: "",
      });
      showToast.success("User created successfully");
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage = error.response?.data?.error || "Failed to create user";
      showToast.error(errorMessage);
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesPlan = !filters.plan || user.plan === filters.plan;
    const matchesSubscription = !filters.subscription_type || user.subscription_type === filters.subscription_type;
    const matchesStatus = !filters.is_active || user.is_active === (filters.is_active === "true");

    return matchesSearch && matchesRole && matchesPlan && matchesSubscription && matchesStatus;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[120px]"
            >
              <option value="">All Roles</option>
              {Object.entries(ROLE_MAPPINGS).map(([role, display]) => (
                <option key={role} value={role}>{display}</option>
              ))}
            </select>

            <select
              value={filters.plan}
              onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[120px]"
            >
              <option value="">All Plans</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="STANDARD">Standard</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>

            <select
              value={filters.subscription_type}
              onChange={(e) => setFilters(prev => ({ ...prev, subscription_type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[120px]"
            >
              <option value="">All Subscriptions</option>
              <option value="TRIAL">Trial</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>

            <select
              value={filters.is_active}
              onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[120px]"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Add User Button */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <LoadingOverlay loading={loading} htmlText="Loading users..." position="absolute" />
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-dark-3">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Documents</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-dark dark:text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatRole(user.role)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {user.subscriptions?.[0]?.plan?.name || user.plan || "No Plan"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  {user._count?.documents && user._count.documents > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedUserForDocuments(user);
                        setIsDocumentsModalOpen(true);
                      }}
                      className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors"
                      title={`View ${user._count.documents} document(s)`}
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={user.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <ModalDialog
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        header="Edit User"
        footer={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank to keep current password"
              />
              <p className="mt-1 text-xs text-gray-400">
                Leave blank to keep current password
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                  <option key={role} value={role} title={description}>
                    {ROLE_MAPPINGS[role as keyof typeof ROLE_MAPPINGS]} - {description}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                {ROLE_DESCRIPTIONS[editForm.role as keyof typeof ROLE_DESCRIPTIONS]}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                value={editForm.company}
                onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Plan
              </label>
              <select
                value={editForm.plan || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value || null }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Plan</option>
                <option value="FREE">Free</option>
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Subscription Type
              </label>
              <select
                value={editForm.subscription_type || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, subscription_type: e.target.value || null }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subscription Type</option>
                <option value="TRIAL">Trial</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_verified"
              checked={editForm.is_verified}
              onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="is_verified" className="ml-2 text-sm font-medium text-gray-300">
              Email Verified
            </label>
          </div>
          <div className="text-xs text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </div>
        </div>
      </ModalDialog>

      {/* Add User Modal */}
      <ModalDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        header="Add New User"
        footer={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
            >
              Create User
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
              <p className="mt-1 text-xs text-gray-400">
                Password is required for new users
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                  <option key={role} value={role} title={description}>
                    {ROLE_MAPPINGS[role as keyof typeof ROLE_MAPPINGS]} - {description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                value={editForm.company}
                onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Plan
              </label>
              <select
                value={editForm.plan || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value || null }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Plan</option>
                <option value="FREE">Free</option>
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Subscription Type
              </label>
              <select
                value={editForm.subscription_type || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, subscription_type: e.target.value || null }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subscription Type</option>
                <option value="TRIAL">Trial</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_verified"
              checked={editForm.is_verified}
              onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="is_verified" className="ml-2 text-sm font-medium text-gray-300">
              Email Verified
            </label>
          </div>
          <div className="text-xs text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </div>
        </div>
      </ModalDialog>

      {/* User Documents Modal */}
      <ModalDialog
        isOpen={isDocumentsModalOpen}
        onClose={() => {
          setIsDocumentsModalOpen(false);
          setSelectedUserForDocuments(null);
        }}
        header={`Documents - ${selectedUserForDocuments?.name || 'User'}`}
        width="80%"
      >
        {selectedUserForDocuments && (
          <UserDocumentsModal 
            user={selectedUserForDocuments}
            onClose={() => {
              setIsDocumentsModalOpen(false);
              setSelectedUserForDocuments(null);
            }}
          />
        )}
      </ModalDialog>
    </div>
  );
}

// User Documents Modal Component
function UserDocumentsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  const isCurrentUserAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  
  // Check if current user is viewing their own documents
  const isViewingOwnDocuments = session?.user?.id === user.id;
  
  // Only use admin routes if current user is admin AND viewing someone else's documents
  const shouldUseAdminRoutes = isCurrentUserAdmin && !isViewingOwnDocuments;

  const fetchUserDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/users/${user.id}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      showToast.error("Failed to fetch user documents");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user.id) {
      fetchUserDocuments();
    }
  }, [user.id, fetchUserDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {documents.length} document(s) for {user.name} ({user.email})
        {isViewingOwnDocuments && (
          <span className="ml-2 text-blue-600">(Your documents)</span>
        )}
        {shouldUseAdminRoutes && (
          <span className="ml-2 text-green-600">(Admin view)</span>
        )}
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents found for this user.
        </div>
      ) : (
        <DocumentsList
          documents={documents}
          onRefresh={fetchUserDocuments}
          onDelete={shouldUseAdminRoutes ? async (documentId: string) => {
            try {
              // Use the unified delete API - admin can delete any document
              await axiosInstance.delete(`/api/documents/${documentId}`);
              fetchUserDocuments();
              showToast.success('Document deleted successfully');
            } catch (error) {
              console.error("Error deleting document:", error);
              showToast.error("Failed to delete document");
            }
          } : undefined}
          onDownload={async (documentId: string) => {
            try {
              const response = await axiosInstance.get(`/api/admin/users/${user.id}/documents/${documentId}/download`, {
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
          canDelete={shouldUseAdminRoutes}
        />
      )}
    </div>
  );
} 