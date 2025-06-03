"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Upload, 
  BarChart3, 
  Menu, 
  X,
  Code
} from "lucide-react";
import React from "react";
import Logo from "../Common/Logo";

interface UserNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserNav: React.FC<UserNavProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/user/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/user/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Knowledge Base",
      href: "/user/knowledge-base",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/user/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Embed Code",
      href: "/user/embed-code",
      icon: <Code className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-dark-3 dark:bg-dark-2 lg:z-10 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col pt-20">
          <div className="flex-grow overflow-y-auto py-2">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
                    ${
                      pathname === item.href 
                        ? "bg-primary text-white" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default UserNav; 