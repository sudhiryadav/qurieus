"use client";

import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { showToast } from "@/components/Common/Toast";
import { Button } from "@/components/ui/button";
import ModalDialog from "@/components/ui/ModalDialog";
import axios from "@/lib/axios";
// import { UserSubscription } from "@prisma/client";
import { UserSubscriptionWithUserAndPlan } from "@/types/subscription";
import { Search, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionWithUserAndPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubscription, setEditingSubscription] = useState<UserSubscriptionWithUserAndPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    status: "",
    currentPeriodStart: "",
    currentPeriodEnd: "",
  });

  const fetchSubscriptions = async () => {
    try {
      const { data } = await axios.get("/api/admin/subscriptions");
      setSubscriptions(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      showToast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (subscription: UserSubscriptionWithUserAndPlan) => {
    setEditingSubscription(subscription);
    setEditForm({
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString().slice(0, 10),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString().slice(0, 10),
    });
  };

  const handleEditSubmit = async () => {
    if (!editingSubscription) return;
    try {
      const { data } = await axios.patch(`/api/admin/subscriptions`, {
        id: editingSubscription.id,
        ...editForm,
        currentPeriodStart: new Date(editForm.currentPeriodStart),
        currentPeriodEnd: new Date(editForm.currentPeriodEnd),
      });
      setSubscriptions(subscriptions.map(s => s.id === editingSubscription.id ? { ...s, ...data } : s));
      setEditingSubscription(null);
      showToast.success("Subscription updated successfully");
    } catch (error) {
      console.error("Error updating subscription:", error);
      showToast.error("Failed to update subscription");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this subscription?")) return;
    try {
      await axios.delete(`/api/admin/subscriptions`, {
        data: { id }
      });
      setSubscriptions(subscriptions.filter(s => s.id !== id));
      showToast.success("Subscription archived successfully");
    } catch (error) {
      console.error("Error deleting subscription:", error);
      showToast.error("Failed to archive subscription");
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

  return (
    <div>
      <LoadingOverlay loading={loading} htmlText="Loading subscriptions..." />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Subscriptions</h1>
        </div>
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
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">No subscriptions found</td>
              </tr>
            ) : (
              filteredSubscriptions.map(sub => (
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
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSubscription(sub.id)}>Archive</Button>
                  </div>
                </td>
              </tr>
              ))
            )}
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