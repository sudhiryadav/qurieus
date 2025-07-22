"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";

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
        <h1 className="text-2xl font-bold">Agents</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={() => setInviteModalOpen(true)}
        >
          Invite Agent
        </button>
      </div>
      
      <div className="bg-white dark:bg-dark-2 rounded shadow p-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No agents found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Email</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Created</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b last:border-0">
                  <td className="py-2">{agent.name}</td>
                  <td className="py-2">{agent.email}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
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
                  <td className="py-2">{new Date(agent.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(agent)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(agent)}
                        className={`text-xs ${
                          agent.is_active 
                            ? "text-orange-600 hover:text-orange-800" 
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {agent.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(agent)}
                        className="text-red-600 hover:text-red-800 text-xs"
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
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setInviteModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Invite Agent</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={inviteForm.name}
                  onChange={handleInviteChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-dark-3 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-dark-3 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={inviteForm.password}
                  onChange={handleInviteChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-dark-3 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Inviting..." : "Invite Agent"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setEditModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Agent</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-dark-3 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-dark-3 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Agent"}
              </button>
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
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 