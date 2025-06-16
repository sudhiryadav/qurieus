"use client";

import { showToast } from "@/components/Common/Toast";
import DocumentList from "@/components/DocumentList";
import UploadDialog from "@/components/UploadDialog";
import axiosInstance from "@/lib/axios";
import { formatFileSize } from "@/lib/utils";
import { Document, SubscriptionPlan } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriptionPage from "../subscription/page";

export default function KnowledgeBase() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<SubscriptionPlan | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [remainingFiles, setRemainingFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [remainingSize, setRemainingSize] = useState(0);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await axiosInstance.get("/api/user/subscription");
        const data = response.data;
        setSubscriptionPlan(data?.plan ?? null);
      } catch (error) {
        console.error("Error checking subscription:", error);
        showToast.error(
          "Error checking subscription status. Please try again later.",
        );
      }
    };

    if (session?.user) {
      checkSubscription();
    }
  }, [status, router, session]);

  useEffect(() => {
    if (subscriptionPlan) {
      setTotalFiles(subscriptionPlan.maxDocs ?? 0);
      setRemainingFiles(
        subscriptionPlan.maxDocs
          ? subscriptionPlan.maxDocs - documents.length
          : 0,
      );
      setTotalSize(
        subscriptionPlan.maxStorageMB
          ? subscriptionPlan.maxStorageMB * 1024 * 1024
          : 0,
      );
      setRemainingSize(
        subscriptionPlan.maxStorageMB
          ? subscriptionPlan.maxStorageMB * 1024 * 1024 -
              documents.reduce((acc, doc) => acc + doc.fileSize, 0)
          : 0,
      );
    }
  }, [documents, subscriptionPlan]);

  if (!subscriptionPlan) {
    return (
      <SubscriptionPage />
    );
  }

  return (
    <div className="mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Knowledge Base
        </h1>
        <button
          onClick={() => setIsUploadDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Upload Documents
        </button>
      </div>

      <div className="mb-4 flex flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
        <p>Allowed Files: {totalFiles}</p>
        <p>Remaining Files: {remainingFiles}</p>
        <p>Allowed Size: {formatFileSize(totalSize)}</p>
        <p>Remaining Size: {formatFileSize(remainingSize)}</p>
      </div>

      <DocumentList key={refreshKey} onFetchDocuments={setDocuments} />

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
