import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import UserLayoutContent from "./UserLayoutContent";
import AuthWrapper from "./AuthWrapper";

interface UserLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function UserLayout({
  children,
  isAdmin = false,
}: UserLayoutProps) {
  return (
    <AuthWrapper isAdmin={isAdmin}>
      <SubscriptionProvider>
        <UserLayoutContent isAdmin={isAdmin}>
          {children}
        </UserLayoutContent>
      </SubscriptionProvider>
    </AuthWrapper>
  );
}
