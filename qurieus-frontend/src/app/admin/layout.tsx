import UserLayout from "../user/layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout isAdmin={true}>{children}</UserLayout>;
} 