import Link from "next/link";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, Upload, BarChart3, Code, ChevronDown, ChevronUp, CreditCard, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

interface SidebarProps {
  // Props are no longer needed as state is managed by context
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

const Sidebar: React.FC<SidebarProps> = () => {
  const { data: session } = useSession();
  const [adminOpen, setAdminOpen] = useState(false);
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebarRef.current || !trigger.current) return;
      // Close sidebar on mobile if clicked outside
      if (
        window.innerWidth < 1024 &&
        sidebarOpen &&
        !sidebarRef.current.contains(target as Node) &&
        !trigger.current.contains(target as Node)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <aside
      ref={sidebarRef}
      className={`absolute left-0 top-0 z-10 flex h-screen w-72 flex-col overflow-y-hidden bg-white duration-300 ease-linear dark:bg-dark-2 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:border-r lg:border-gray-200 dark:border-dark-3`}
    >
      <div className="pt-2 pr-2 flex items-center justify-end gap-2 px-6 py-5.5 lg:py-6.5">
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-0 px-2">
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
};

export default Sidebar; 