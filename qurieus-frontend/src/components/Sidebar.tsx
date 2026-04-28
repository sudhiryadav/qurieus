import Link from "next/link";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, Upload, BarChart3, Code, CreditCard, X, Users as UsersIcon, MessageSquare, Globe, Clock, Star, Activity, Settings } from "lucide-react";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/useSidebar";

export const userNav = [
  { name: "Dashboard", href: "/user/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, hideForAgent: true },
  { name: "Profile", href: "/user/profile", icon: <User className="h-5 w-5" />, hideForAgent: true },
  { name: "Feedback", href: "/user/feedback", icon: <Star className="h-5 w-5" />, hideForAgent: true },
  { name: "Agents", href: "/user/agents", icon: <UsersIcon className="h-5 w-5" />, hideForAgent: true },
  { name: "Agent Dashboard", href: "/agent/dashboard", icon: <MessageSquare className="h-5 w-5" />, agentOnly: true },
  { name: "Subscription", href: "/user/subscription", icon: <CreditCard className="h-5 w-5" />, hideForAgent: true },
  { name: "Knowledge Base", href: "/user/knowledge-base", icon: <Upload className="h-5 w-5" />, hideForAgent: true },
  { name: "Analytics", href: "/user/analytics", icon: <BarChart3 className="h-5 w-5" />, hideForAgent: true },
  { name: "Embed Code", href: "/user/embed-code", icon: <Code className="h-5 w-5" />, hideForAgent: true },
];

const adminNav = [
  { name: "Users", href: "/admin/users", icon: <User className="h-4 w-4 mr-2" /> },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
  { name: "Trial Extensions", href: "/admin/trial-extensions", icon: <Clock className="h-4 w-4 mr-2" /> },
  { name: "Plans", href: "/admin/plans", icon: <Code className="h-4 w-4 mr-2" /> },
  { name: "Knowledge Base", href: "/admin/knowledge-base", icon: <Upload className="h-4 w-4 mr-2" /> },
  { name: "Website Crawler", href: "/admin/website-crawler", icon: <Globe className="h-4 w-4 mr-2" /> },
  { name: "Email Broadcast", href: "/admin/email-broadcast", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  { name: "Testimonials", href: "/admin/testimonials", icon: <Star className="h-4 w-4 mr-2" /> },
  { name: "Services", href: "/admin/services", icon: <Activity className="h-4 w-4 mr-2" /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4 mr-2" />, superAdminOnly: true },
];

const Sidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { sidebarOpen, updateSidebarOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebarRef.current || !trigger.current) return;
      if (
        window.innerWidth < 1024 
        // &&
        // sidebarOpen &&
        // !sidebarRef.current.contains(target as Node) &&
        // !trigger.current.contains(target as Node)
      ) {
        updateSidebarOpen(false);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, updateSidebarOpen]);

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
          onClick={() => updateSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-0 px-2">
          {/* Admin section - shown first for admins */}
          {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
            <div className="mb-2">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Admin
              </p>
              <div className="space-y-0.5">
                {adminNav.map((item) => {
                  if (item.superAdminOnly && session?.user?.role !== "SUPER_ADMIN") {
                    return null;
                  }
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => updateSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                        ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"}`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <hr className="my-3 border-gray-200 dark:border-dark-3" />
            </div>
          )}
          {userNav.map((item) => {
            // Skip agent-only items if user is not an agent
            if (item.agentOnly && session?.user?.role !== "AGENT") {
              return null;
            }
            
            // Skip items that should be hidden for agents
            if (item.hideForAgent && session?.user?.role === "AGENT") {
              return null;
            }
            
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => updateSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 