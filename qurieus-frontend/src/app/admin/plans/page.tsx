"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ModalDialog from "@/components/ui/ModalDialog";
import { Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";

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
  paddleProductId?: string;
  paddlePriceId?: string;
}

interface PaddleConfig {
  productId: string;
  priceId: string;
  trialDays: number;
  billingCycle: string;
}

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    const fetchPlans = async () => {
      try {
        const { data } = await axios.get("/api/admin/subscription-plans");
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        showToast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchPlans();
    }
  }, [status, router, session]);

  const fetchPaddleConfig = async (planId: string) => {
    try {
      setPaddleConfig(null);
      const { data } = await axios.get(`/api/admin/subscription-plans/${planId}/paddle`);
      setPaddleConfig(data);
    } catch (error) {
      console.error("Error fetching Paddle config:", error);
      showToast.error("Failed to fetch Paddle config");
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
      const response = await axios.put(
        `/api/admin/subscription-plans/${editingPlan.id}`,
        {
          ...editForm,
          features: editForm.features.split(",").map(f => f.trim()).filter(Boolean),
        }
      );
      const updatedPlan = await response.data;
      setPlans(plans.map(plan => plan.id === editingPlan.id ? updatedPlan : plan));
      setEditingPlan(null);
      showToast.success("Plan updated successfully");
    } catch (error) {
      console.error("Error updating plan:", error);
      showToast.error("Failed to update plan");
    }
  };

  const handlePaddleSync = async () => {
    if (!editingPlan) return;
    setPaddleSyncLoading(true);
    setPaddleSyncError(null);
    try {
      await axios.post(`/api/admin/subscription-plans/${editingPlan.id}/paddle/product`);
      await axios.post(`/api/admin/subscription-plans/${editingPlan.id}/paddle/price`);
      await fetchPaddleConfig(editingPlan.id);
      showToast.success("Paddle sync successful");
    } catch (err: any) {
      setPaddleSyncError("Paddle sync failed");
      showToast.error("Paddle sync failed");
    } finally {
      setPaddleSyncLoading(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      const response = await axios.post("/api/admin/subscription-plans", {
        ...editForm,
        features: editForm.features.split(",").map(f => f.trim()).filter(Boolean),
      });
      const newPlan = await response.data;
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
      showToast.success("Plan created successfully");
    } catch (error) {
      console.error("Error creating plan:", error);
      showToast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axios.delete(`/api/admin/subscription-plans/${planId}`);
      setPlans(plans.filter(plan => plan.id !== planId));
      showToast.success("Plan deleted successfully");
    } catch (error) {
      console.error("Error deleting plan:", error);
      showToast.error("Failed to delete plan");
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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