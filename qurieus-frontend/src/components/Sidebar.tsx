import Link from "next/link";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, Upload, BarChart3, Code, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const userNav = [
  { name: "Dashboard", href: "/user/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Profile", href: "/user/profile", icon: <User className="h-5 w-5" /> },
  { name: "Subscription", href: "/user/subscription", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Knowledge Base", href: "/user/knowledge-base", icon: <Upload className="h-5 w-5" /> },
  { name: "Analytics", href: "/user/analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { name: "Embed Code", href: "/user/embed-code", icon: <Code className="h-5 w-5" /> },
];

const adminNav = [
  { name: "Users", href: "/admin/users", icon: <User className="h-4 w-4 mr-2" /> },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
  { name: "Plans", href: "/admin/plans", icon: <Code className="h-4 w-4 mr-2" /> },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const [adminOpen, setAdminOpen] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on mobile if not open
  return (
    <aside
      className={`min-h-screen w-64 bg-white dark:bg-dark-2 border-r border-gray-200 dark:border-dark-3 shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}
      aria-label="Sidebar"
    >
      {/* Overlay for mobile */}
      {/* <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-40 lg:hidden transition-opacity duration-300 ${isOpen ? "block" : "hidden"}`}
        onClick={onClose}
      /> */}
      <div className="flex flex-col h-full py-6 px-4">
        <div className="mb-8">
          <span className="text-lg font-bold">User Menu</span>
        </div>
        <nav className="flex-1 space-y-2">
          {userNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
          {session?.user?.role === "SUPER_ADMIN" && (
            <div>
              <button
                className="flex items-center w-full gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3 rounded-md transition-colors focus:outline-none"
                onClick={() => setAdminOpen((v) => !v)}
                aria-expanded={adminOpen}
              >
                <BarChart3 className="h-5 w-5" />
                Admin
                {adminOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
              </button>
              {adminOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {adminNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors
                          ${isActive ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:text-primary"}`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
} 