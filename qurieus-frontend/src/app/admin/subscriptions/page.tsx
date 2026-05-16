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
import ConfirmDelete from '@/components/ConfirmDelete';
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

type PaddleWebhookDebug = {
  sourceApp: string;
  productTag: string;
  processedCount: number;
  ignoredCount: number;
  lastEvent: string | null;
  lastTag: string | null;
  lastIgnoredReason: string | null;
  updatedAt: string;
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionWithUserAndPlan[]>([]);
  const [webhookDebug, setWebhookDebug] = useState<PaddleWebhookDebug | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSubscription, setEditingSubscription] = useState<UserSubscriptionWithUserAndPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<UserSubscriptionWithUserAndPlan | null>(null);
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
      showToast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookDebug = async () => {
    try {
      const { data } = await axios.get("/api/admin/paddle/webhook-debug");
      setWebhookDebug(data);
    } catch (error) {
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
      showToast.error("Failed to update subscription");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    const subscription = subscriptions.find(s => s.id === id);
    if (!subscription) return;
    
    setSubscriptionToDelete(subscription);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!subscriptionToDelete) return;
    
    try {
      await axios.delete(`/api/admin/subscriptions`, {
        data: { id: subscriptionToDelete.id }
      });
      setSubscriptions(subscriptions.filter(s => s.id !== subscriptionToDelete.id));
      showToast.success("Subscription archived successfully");
    } catch (error) {
      showToast.error("Failed to archive subscription");
    } finally {
      setDeleteConfirmOpen(false);
      setSubscriptionToDelete(null);
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
    fetchWebhookDebug();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscriptions
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-dark-3 dark:bg-dark-2">
      <LoadingOverlay loading={loading} htmlText="Loading subscriptions..." position="absolute" />
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-dark-3 dark:bg-dark-3/80">
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
                <td
                  colSpan={8}
                  className="border-b border-gray-100 bg-white py-6 text-center text-gray-500 dark:border-dark-3 dark:bg-dark-2 dark:text-gray-400"
                >
                  No subscriptions found
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map(sub => (
              <tr
                key={sub.id}
                className="border-b border-gray-100 bg-white hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3/60"
              >
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
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSubscription(sub.id)}>
                      Archive
                    </Button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Paddle Webhook Debug
        </h2>
        {!webhookDebug ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Debug data unavailable.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200 md:grid-cols-2">
            <div>
              Source App:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.sourceApp}
              </span>
            </div>
            <div>
              Product Tag:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.productTag}
              </span>
            </div>
            <div>
              Processed Count:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.processedCount}
              </span>
            </div>
            <div>
              Ignored Count:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.ignoredCount}
              </span>
            </div>
            <div>
              Last Event:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.lastEvent || "-"}
              </span>
            </div>
            <div>
              Last Tag:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.lastTag || "-"}
              </span>
            </div>
            <div>
              Last Reason:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookDebug.lastIgnoredReason || "-"}
              </span>
            </div>
            <div>
              Updated At:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(webhookDebug.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}
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
          <FormField label="Status">
            <Input
              type="text"
              value={editForm.status}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, status: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Period Start">
            <Input
              type="date"
              value={editForm.currentPeriodStart}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  currentPeriodStart: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Period End">
            <Input
              type="date"
              value={editForm.currentPeriodEnd}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  currentPeriodEnd: e.target.value,
                }))
              }
            />
          </FormField>
        </div>
      </ModalDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDelete
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Archive Subscription"
        message={`Are you sure you want to archive the subscription for ${subscriptionToDelete?.user.name}? This action cannot be undone.`}
        confirmText="Archive"
        isLoading={loading}
      />
    </div>
  );
} 