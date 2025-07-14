"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Upload, 
  BarChart3, 
  Menu, 
  X,
  Code,
  MessageSquare
} from "lucide-react";
import React from "react";
import Logo from "../Common/Logo";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logger } from "@/lib/logger";

interface UserNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserNav: React.FC<UserNavProps> = ({ isOpen, onClose }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  logger.info("UserNav session", { session, status });
  if (!session?.user) {
    return <div style={{ color: 'red', padding: 16 }}>No user session found</div>;
  }

  logger.info("xxx session", { role: session?.user?.role });

  // Don't render anything for agents - they have their own navigation
  if (session?.user?.role === "AGENT") {
    return null;
  }

  const isAgent = session?.user?.role === "AGENT";

  // Define navigation items based on user role
  const getNavItems = () => {
    if (isAgent) {
      // For agents, only show agent dashboard
      return [
        {
          name: "Agent Dashboard",
          href: "/agent/dashboard",
          icon: <MessageSquare className="h-5 w-5" />,
        },
      ];
    } else {
      // For regular users and admins, show all user pages
      return [
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
    }
  };

  const navItems = getNavItems();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/signin")}>
          Sign In
        </Button>
        <Button onClick={() => router.push("/signup")}>Sign Up</Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {navItems.map((item) => (
            <DropdownMenuItem asChild key={item.href}>
              <Link
                href={item.href}
                className={pathname === item.href ? "text-primary font-semibold" : ""}
              >
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
          {session.user.role === "SUPER_ADMIN" && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Admin</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <Link href="/admin/users" className={pathname === "/admin/users" ? "text-primary font-semibold" : ""}>
                    <User className="mr-2 h-4 w-4 inline" /> Users
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/subscriptions" className={pathname === "/admin/subscriptions" ? "text-primary font-semibold" : ""}>
                    <BarChart3 className="mr-2 h-4 w-4 inline" /> Subscriptions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/plans" className={pathname === "/admin/plans" ? "text-primary font-semibold" : ""}>
                    <Code className="mr-2 h-4 w-4 inline" /> Plans
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav; 