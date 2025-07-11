"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ModalDialog from "@/components/ui/ModalDialog";
import { Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";
import Loader from "@/components/Common/Loader";
import LoadingOverlay from "@/components/Common/LoadingOverlay";

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
  paddleConfig?: PaddleConfig;
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
  const [showInactivePlans, setShowInactivePlans] = useState(true);
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
  };

  const handleSavePlan = async () => {
    try {
      let response;
      if (editingPlan) {
        response = await axios.patch(
        `/api/admin/subscription-plans/${editingPlan.id}`,
        {
          ...editForm,
          features: editForm.features.split(",").map(f => f.trim()).filter(Boolean),
        }
      );
        showToast.success("Subscription plan updated successfully. Paddle sync will be triggered automatically.");
      } else {
        response = await axios.post("/api/admin/subscription-plans", {
        ...editForm,
        features: editForm.features.split(",").map(f => f.trim()).filter(Boolean),
      });
        showToast.success("Plan created successfully. Paddle sync will be triggered automatically.");
      }
      // Always refresh plans from backend after add/edit
      const { data: refreshedPlans } = await axios.get("/api/admin/subscription-plans");
      setPlans(refreshedPlans);
      setEditingPlan(null);
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
    } catch (error) {
      if (editingPlan) {
        console.error("Error updating subscription plan:", error);
        showToast.error("Failed to update subscription plan");
      } else {
      console.error("Error creating plan:", error);
      showToast.error("Failed to create plan");
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this plan? This will make it inactive but preserve all data.")) return;
    try {
      await axios.delete(`/api/admin/subscription-plans/${planId}`);
      // Update the plan in the local state to show it as inactive
      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, isActive: false } : plan
      ));
      showToast.success("Plan deactivated successfully");
    } catch (error) {
      console.error("Error deactivating plan:", error);
      showToast.error("Failed to deactivate plan");
    }
  };

  const handleReactivatePlan = async (planId: string) => {
    try {
      await axios.patch(`/api/admin/subscription-plans/${planId}`, {
        isActive: true
      });
      // Update the plan in the local state to show it as active
      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, isActive: true } : plan
      ));
      showToast.success("Plan reactivated successfully");
    } catch (error) {
      console.error("Error reactivating plan:", error);
      showToast.error("Failed to reactivate plan");
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = showInactivePlans || plan.isActive;
    
    return matchesSearch && matchesStatus;
  });


  return (
    <div className="mx-auto px-4">
      <LoadingOverlay loading={loading} htmlText="Loading plans..." />
      {/* Workflow Note */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Paddle Integration Workflow
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>• <strong>Automatic Sync:</strong> When you create or edit a plan, it automatically syncs to Paddle</p>
              <p>• <strong>Free Plans:</strong> Free Trial and $0 plans are not synced to Paddle</p>
              <p>• <strong>Product Creation:</strong> If no Paddle product exists, one will be created automatically</p>
              <p>• <strong>Price Updates:</strong> Existing Paddle products and prices are updated with your changes</p>
              <p>• <strong>Plan Deactivation:</strong> Plans are deactivated (not deleted) to preserve data and Paddle configuration</p>
              <p>• <strong>Manual Sync:</strong> Use &quot;Sync Paddle IDs&quot; to fetch existing product/price IDs from Paddle</p>
            </div>
          </div>
        </div>
      </div>
      
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
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showInactivePlans}
                onChange={e => setShowInactivePlans(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Show inactive plans</span>
            </label>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Ideal For</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Docs</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Storage (MB)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Queries/Day</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Paddle Product ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Paddle Price ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map(plan => (
              <tr key={plan.id} className="border-b dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">{plan.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.price === 0 ? '-' : `${plan.currency} ${plan.price}`}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(plan.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.idealFor}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.maxDocs ?? 'Custom'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.maxStorageMB ?? 'Custom'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{plan.maxQueriesPerDay ?? 'Custom'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{
                  plan.name === "Free Trial" || plan.price === 0 ? '-' : (plan.paddleConfig?.productId || <span className="text-gray-500">Not synced</span>)
                }</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{
                  plan.name === "Free Trial" || plan.price === 0 ? '-' : (plan.paddleConfig?.priceId || <span className="text-gray-500">Not synced</span>)
                }</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>Edit</Button>
                    {plan.isActive ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReactivatePlan(plan.id)}
                      >
                        Reactivate
                      </Button>
                    )}
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
        width="600px"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button onClick={handleSavePlan}>Save Changes</Button>
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
      {/* Add Plan Modal */}
      <ModalDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        header="Add New Plan"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan}>Create Plan</Button>
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