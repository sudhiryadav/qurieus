"use client";

import { showToast } from "@/components/Common/Toast";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import UserLayoutContent from "./UserLayoutContent";

export default function UserLayout({
  children,
  isAdmin,
  }: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <SubscriptionProvider>
      <div className="relative flex h-screen overflow-hidden">
        <Sidebar/>
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <main className="flex-1 p-4 md:p-6 2xl:p-10">
            <UserLayoutContent isAdmin={isAdmin}>
              {children}
            </UserLayoutContent>
          </main>
        </div>
      </div>
    </SubscriptionProvider>
  );
}
