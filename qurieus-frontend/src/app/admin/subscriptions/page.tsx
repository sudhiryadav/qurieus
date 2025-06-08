"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ModalDialog from "@/components/ui/ModalDialog";
import { toast } from "react-hot-toast";
import { Plus, Search } from "lucide-react";

interface Subscription {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  plan: {
    id: string;
    name: string;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    status: "",
    currentPeriodStart: "",
    currentPeriodEnd: "",
  });

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions");
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditForm({
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.slice(0, 10),
      currentPeriodEnd: subscription.currentPeriodEnd.slice(0, 10),
    });
  };

  const handleEditSubmit = async () => {
    if (!editingSubscription) return;
    try {
      const response = await fetch(`/api/admin/subscriptions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSubscription.id,
          ...editForm,
          currentPeriodStart: new Date(editForm.currentPeriodStart),
          currentPeriodEnd: new Date(editForm.currentPeriodEnd),
        }),
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      const updated = await response.json();
      setSubscriptions(subscriptions.map(s => s.id === editingSubscription.id ? { ...s, ...updated } : s));
      setEditingSubscription(null);
      toast.success("Subscription updated successfully");
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;
    try {
      const response = await fetch(`/api/admin/subscriptions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete subscription");
      setSubscriptions(subscriptions.filter(s => s.id !== id));
      toast.success("Subscription deleted successfully");
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription");
    }
  };

  const filteredSubscriptions = subscriptions.filter(s =>
    s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin: Subscriptions</h1>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-dark-3">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Period Start</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Period End</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map(sub => (
              <tr key={sub.id} className="border-b dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">{sub.user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{sub.user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{sub.plan.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{sub.status}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(sub.currentPeriodStart).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(sub)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSubscription(sub.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Subscription Modal */}
      <ModalDialog
        isOpen={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        header="Edit Subscription"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditingSubscription(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <input type="text" value={editForm.status} onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Period Start</label>
            <input type="date" value={editForm.currentPeriodStart} onChange={e => setEditForm(prev => ({ ...prev, currentPeriodStart: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Period End</label>
            <input type="date" value={editForm.currentPeriodEnd} onChange={e => setEditForm(prev => ({ ...prev, currentPeriodEnd: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
} 