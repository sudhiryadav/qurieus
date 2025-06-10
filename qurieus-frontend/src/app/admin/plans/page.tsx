"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ModalDialog from "@/components/ui/ModalDialog";
import { toast } from "react-hot-toast";
import { Plus, Search } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  idealFor: string;
  keyLimits: string;
  maxDocs: number | null;
  maxStorageMB: number | null;
  maxQueriesPerDay: number | null;
}

interface PaddleConfig {
  productId: string;
  priceId: string;
  trialDays: number;
  billingCycle: string;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "INR",
    features: "",
    isActive: true,
    idealFor: "",
    keyLimits: "",
    maxDocs: undefined as number | undefined,
    maxStorageMB: undefined as number | undefined,
    maxQueriesPerDay: undefined as number | undefined,
  });
  const [paddleConfig, setPaddleConfig] = useState<PaddleConfig | null>(null);
  const [paddleSyncLoading, setPaddleSyncLoading] = useState(false);
  const [paddleSyncError, setPaddleSyncError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/subscription-plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaddleConfig = async (planId: string) => {
    try {
      setPaddleConfig(null);
      const res = await fetch(`/api/admin/subscription-plans/${planId}/paddle`);
      if (!res.ok) throw new Error("Failed to fetch Paddle config");
      const data = await res.json();
      setPaddleConfig(data);
    } catch (err) {
      setPaddleConfig(null);
    }
  };

  const handleEditClick = (plan: Plan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      features: plan.features.join(", "),
      isActive: plan.isActive,
      idealFor: plan.idealFor,
      keyLimits: plan.keyLimits,
      maxDocs: plan.maxDocs === null ? undefined : plan.maxDocs,
      maxStorageMB: plan.maxStorageMB === null ? undefined : plan.maxStorageMB,
      maxQueriesPerDay: plan.maxQueriesPerDay === null ? undefined : plan.maxQueriesPerDay,
    });
    fetchPaddleConfig(plan.id);
  };

  const handleEditSubmit = async () => {
    if (!editingPlan) return;
    try {
      const response = await fetch(`/api/admin/subscription-plans`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan.id,
          ...editForm,
          features: editForm.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Failed to update plan");
      const updatedPlan = await response.json();
      setPlans(plans.map(plan => plan.id === editingPlan.id ? updatedPlan : plan));
      setEditingPlan(null);
      toast.success("Plan updated successfully");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    }
  };

  const handlePaddleSync = async () => {
    if (!editingPlan) return;
    setPaddleSyncLoading(true);
    setPaddleSyncError(null);
    try {
      await fetch(`/api/admin/subscription-plans/${editingPlan.id}/paddle/product`, { method: "POST" });
      await fetch(`/api/admin/subscription-plans/${editingPlan.id}/paddle/price`, { method: "POST" });
      await fetchPaddleConfig(editingPlan.id);
      toast.success("Paddle sync successful");
    } catch (err: any) {
      setPaddleSyncError("Paddle sync failed");
      toast.error("Paddle sync failed");
    } finally {
      setPaddleSyncLoading(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      const response = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          features: editForm.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Failed to create plan");
      const newPlan = await response.json();
      setPlans([newPlan, ...plans]);
      setIsAddModalOpen(false);
      setEditForm({
        name: "",
        description: "",
        price: 0,
        currency: "INR",
        features: "",
        isActive: true,
        idealFor: "",
        keyLimits: "",
        maxDocs: undefined,
        maxStorageMB: undefined,
        maxQueriesPerDay: undefined,
      });
      toast.success("Plan created successfully");
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      const response = await fetch(`/api/admin/subscription-plans`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: planId }),
      });
      if (!response.ok) throw new Error("Failed to delete plan");
      setPlans(plans.filter(plan => plan.id !== planId));
      toast.success("Plan deleted successfully");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin: Plans</h1>
        <p>Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Plans</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <Button onClick={() => { setIsAddModalOpen(true); setEditForm({ name: "", description: "", price: 0, currency: "INR", features: "", isActive: true, idealFor: "", keyLimits: "", maxDocs: undefined, maxStorageMB: undefined, maxQueriesPerDay: undefined }); }} className="flex items-center space-x-2 whitespace-nowrap">
            <Plus className="h-4 w-4" />
            <span>Add Plan</span>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-dark-3">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
              {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Currency</th> */}
              {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Features</th> */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Ideal For</th>
              {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Key Limits</th> */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Docs</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Storage (MB)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Queries/Day</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map(plan => (
              <tr key={plan.id} className="border-b dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">{plan.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.price === 0 ? '-' : `${plan.currency} ${plan.price}`}</td>
                {/* <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.currency}</td> */}
                {/* <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  <ul className="list-disc pl-4">
                    {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </td> */}
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.isActive ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(plan.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.idealFor}</td>
                {/* <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.keyLimits}</td> */}
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.maxDocs ?? 'Custom'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.maxStorageMB ?? 'Custom'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.maxQueriesPerDay ?? 'Custom'}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Plan Modal */}
      <ModalDialog
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        header="Edit Plan"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
            <input type="number" value={editForm.price} onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
            <input type="text" value={editForm.currency} onChange={e => setEditForm(prev => ({ ...prev, currency: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Features (comma separated)</label>
            <input type="text" value={editForm.features} onChange={e => setEditForm(prev => ({ ...prev, features: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-300">Active</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ideal For</label>
            <input type="text" value={editForm.idealFor} onChange={e => setEditForm(prev => ({ ...prev, idealFor: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Key Limits</label>
            <input type="text" value={editForm.keyLimits} onChange={e => setEditForm(prev => ({ ...prev, keyLimits: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Docs</label>
            <input type="number" value={editForm.maxDocs ?? ''} onChange={e => setEditForm(prev => ({ ...prev, maxDocs: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Storage (MB)</label>
            <input type="number" value={editForm.maxStorageMB ?? ''} onChange={e => setEditForm(prev => ({ ...prev, maxStorageMB: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Queries/Day</label>
            <input type="number" value={editForm.maxQueriesPerDay ?? ''} onChange={e => setEditForm(prev => ({ ...prev, maxQueriesPerDay: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {editingPlan && (
            <div className="mt-6 p-4 rounded bg-gray-800 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Paddle Sync</span>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  onClick={handlePaddleSync}
                  disabled={paddleSyncLoading}
                >
                  {paddleSyncLoading ? "Syncing..." : "Sync to Paddle"}
                </button>
              </div>
              {paddleSyncError && <div className="text-red-400 text-sm mb-2">{paddleSyncError}</div>}
              <div className="text-sm text-gray-300">
                <div><b>Product ID:</b> {paddleConfig?.productId || <span className="text-gray-500">Not synced</span>}</div>
                <div><b>Price ID:</b> {paddleConfig?.priceId || <span className="text-gray-500">Not synced</span>}</div>
                <div><b>Trial Days:</b> {paddleConfig?.trialDays ?? <span className="text-gray-500">-</span>}</div>
                <div><b>Billing Cycle:</b> {paddleConfig?.billingCycle ?? <span className="text-gray-500">-</span>}</div>
              </div>
            </div>
          )}
        </div>
      </ModalDialog>
      {/* Add Plan Modal */}
      <ModalDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        header="Add New Plan"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPlan}>Create Plan</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
            <input type="number" value={editForm.price} onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
            <input type="text" value={editForm.currency} onChange={e => setEditForm(prev => ({ ...prev, currency: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Features (comma separated)</label>
            <input type="text" value={editForm.features} onChange={e => setEditForm(prev => ({ ...prev, features: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-300">Active</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ideal For</label>
            <input type="text" value={editForm.idealFor} onChange={e => setEditForm(prev => ({ ...prev, idealFor: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Key Limits</label>
            <input type="text" value={editForm.keyLimits} onChange={e => setEditForm(prev => ({ ...prev, keyLimits: e.target.value }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Docs</label>
            <input type="number" value={editForm.maxDocs ?? ''} onChange={e => setEditForm(prev => ({ ...prev, maxDocs: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Storage (MB)</label>
            <input type="number" value={editForm.maxStorageMB ?? ''} onChange={e => setEditForm(prev => ({ ...prev, maxStorageMB: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Queries/Day</label>
            <input type="number" value={editForm.maxQueriesPerDay ?? ''} onChange={e => setEditForm(prev => ({ ...prev, maxQueriesPerDay: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
} 