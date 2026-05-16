"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

interface Agent {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  agent?: {
    isOnline?: boolean;
    isAvailable?: boolean;
    currentChats?: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/agents");
      setAgents(response.data.agents || []);
    } catch (err) {
      showToast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Handle invite form input
  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Handle edit form input
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Handle invite form submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/agents", inviteForm);
      showToast.success("Agent created successfully");
      setInviteModalOpen(false);
      setInviteForm({ name: "", email: "", password: "" });
      fetchAgents();
    } catch (err: any) {
      showToast.error(err.response?.data?.error || err.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setSubmitting(true);
    try {
      await axiosInstance.put(`/api/agents/${selectedAgent.id}`, editForm);
      showToast.success("Agent updated successfully");
      setEditModalOpen(false);
      setSelectedAgent(null);
      fetchAgents();
    } catch (err: any) {
      showToast.error(err.response?.data?.error || err.message || "Failed to update agent");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (agent: Agent) => {
    try {
      const response = await axiosInstance.patch(`/api/agents/${agent.id}/status`);
      showToast.success(response.data.message);
      fetchAgents();
    } catch (err: any) {
      showToast.error(err.response?.data?.error || err.message || "Failed to update status");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedAgent) return;
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/api/agents/${selectedAgent.id}`);
      showToast.success("Agent deleted successfully");
      setDeleteConfirmOpen(false);
      setSelectedAgent(null);
      fetchAgents();
    } catch (err: any) {
      showToast.error(err.response?.data?.error || err.message || "Failed to delete agent");
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditForm({ name: agent.name, email: agent.email });
    setEditModalOpen(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (agent: Agent) => {
    setSelectedAgent(agent);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>Invite Agent</Button>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-dark-3 dark:bg-dark-2 p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No agents found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-3">
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-200">Name</th>
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-200">Email</th>
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-200">Created</th>
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-gray-100 last:border-0 dark:border-dark-3">
                  <td className="py-2 text-gray-900 dark:text-white">{agent.name}</td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{agent.email}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" 
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </span>
                    {agent.agent && (
                      <span className="ml-2 px-2 py-1 rounded text-xs border" style={{
                        backgroundColor: agent.agent.isOnline
                          ? agent.agent.isAvailable
                            ? '#d1fae5' // green-100
                            : '#fef3c7' // yellow-100
                          : '#f3f4f6', // gray-100
                        color: agent.agent.isOnline
                          ? agent.agent.isAvailable
                            ? '#065f46' // green-800
                            : '#92400e' // yellow-800
                          : '#374151', // gray-800
                        borderColor: agent.agent.isOnline
                          ? agent.agent.isAvailable
                            ? '#6ee7b7' // green-200
                            : '#fde68a' // yellow-200
                          : '#d1d5db', // gray-200
                      }}>
                        {agent.agent.isOnline
                          ? agent.agent.isAvailable
                            ? 'Available for chat'
                            : 'Busy'
                          : 'Offline'}
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{new Date(agent.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(agent)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(agent)}
                        className={`text-xs ${
                          agent.is_active 
                            ? "text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300" 
                            : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        }`}
                      >
                        {agent.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(agent)}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setInviteModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Invite Agent</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <FormField label="Name">
                <Input
                  type="text"
                  name="name"
                  value={inviteForm.name}
                  onChange={handleInviteChange}
                  required
                />
              </FormField>
              <FormField label="Email">
                <Input
                  type="email"
                  name="email"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                  required
                />
              </FormField>
              <FormField label="Password">
                <Input
                  type="password"
                  name="password"
                  value={inviteForm.password}
                  onChange={handleInviteChange}
                  required
                />
              </FormField>
              <Button type="submit" className="w-full" loading={submitting}>
                {submitting ? "Inviting..." : "Invite Agent"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setEditModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Agent</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormField label="Name">
                <Input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </FormField>
              <FormField label="Email">
                <Input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                />
              </FormField>
              <Button type="submit" className="w-full" loading={submitting}>
                {submitting ? "Updating..." : "Update Agent"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">Delete Agent</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{selectedAgent.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                loading={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 