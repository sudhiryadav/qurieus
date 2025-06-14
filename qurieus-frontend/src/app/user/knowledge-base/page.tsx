'use client';

import { showToast } from "@/components/Common/Toast";
import DocumentList from "@/components/DocumentList";
import Pricing from "@/components/Pricing";
import UploadDialog from "@/components/UploadDialog";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function KnowledgeBase() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubscriptionChecked, setIsSubscriptionChecked] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await axiosInstance.get("/api/user/subscription/check");
        const data = response.data;
        setIsSubscriptionChecked(data.hasSubscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
        showToast.error(
          "Error checking subscription status. Please try again later.",
        );
        router.push("/pricing");
      }
    };

    if (session?.user) {
      checkSubscription();
    }
  }, [status, router, session]);

  if (!isSubscriptionChecked) {
    return (
      <div className="flex h-screen w-full items-center flex-col">
        <span className="text-xl font-bold text-dark dark:text-white mb-4">Please subscribe to a plan to start uploading documents.</span>
        <Pricing/>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Knowledge Base</h1>
        <button
          onClick={() => setIsUploadDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Upload Documents
        </button>
      </div>

      <DocumentList key={refreshKey} />

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
} 