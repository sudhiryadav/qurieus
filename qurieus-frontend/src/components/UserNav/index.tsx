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
  Code
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

interface UserNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserNav: React.FC<UserNavProps> = ({ isOpen, onClose }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  console.log("UserNav session", session, "status", status);
  if (!session?.user) {
    return <div style={{ color: 'red', padding: 16 }}>No user session found</div>;
  }

  console.log('xxx session' , session?.user?.role);

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
              <Link href={item.href}>{item.name}</Link>
            </DropdownMenuItem>
          ))}
          {session.user.role === "SUPER_ADMIN" && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Admin</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <Link href="/admin/users">Users</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/subscriptions">Subscriptions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/plans">Plans</Link>
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