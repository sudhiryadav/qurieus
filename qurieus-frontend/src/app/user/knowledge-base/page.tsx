'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import DocumentList from "@/components/DocumentList";
import UploadDialog from "@/components/UploadDialog";

export default function KnowledgeBase() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user || !router) {
        return;
      }
      
      try {
        const response = await fetch('/api/subscription/check');
        const data = await response.json();
        
        if (!data.hasActiveSubscription) {
          toast.error('Please subscribe to a plan to access the knowledge base');
          router.push('/user/subscription');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast.error('Error checking subscription status');
      }
    };

    if (session?.user) {
      checkSubscription();
    }
  }, [session, router]);

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