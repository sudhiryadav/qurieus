"use client";
import type { JSX } from "react";
import { showToast } from "@/components/Common/Toast";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "../Common/Logo";

import { useSidebar } from "@/hooks/useSidebar";
import menuData from "./menuData";
import { userNav } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Info, DollarSign, Phone, BookOpen, Users, Briefcase, Layers, Rocket } from "lucide-react";

// Icon mapping for menu items (align-middle for inline flow, self-center for flex)
const menuIcons: Record<string, JSX.Element> = {
  Home: <Home className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  About: <Info className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  Pricing: <DollarSign className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  Contact: <Phone className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  Blog: <BookOpen className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  "For You": <Users className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  Lawyers: <Briefcase className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  HR: <Users className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  SaaS: <Layers className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
  Startups: <Rocket className="mr-2 h-4 w-4 shrink-0 self-center align-middle" />,
};

const Header: React.FC = () => {
  const { data: session } = useSession();
  const { sidebarOpen, updateSidebarOpen } = useSidebar();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathUrl = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  // Handle click outside of user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: any) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const { theme, setTheme } = useTheme();

  const isUserRoute = pathUrl.startsWith("/user") || pathUrl.startsWith("/admin");
  const isAgentRoute = pathUrl.startsWith("/agent");

  // Helper function to format user role
  const formatUserRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'USER':
        return 'User';
      case 'AGENT':
        return 'Agent';
      default:
        return role;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      showToast.error("Failed to sign out");
    }
  };

  // Render agent navigation (simple dashboard link)
  const renderAgentNav = () => {
    if (session?.user?.role === "AGENT") {
      return (
        <div className="flex items-center space-x-4">
          <Link href="/agent/dashboard">
            <Button variant="ghost" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">Agent</p>
                </div>
                <UserAvatar
                  name={session.user.name || "Agent"}
                  image={session.user.image}
                  userId={session.user.id}
                  size="sm"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-neutral-50 dark:bg-neutral-900">
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    return null;
  };

  // Render regular user navigation (dropdown menu)
  const renderUserNav = () => {
    if (session?.user && session.user.role !== "AGENT") {
      return (
        <div className="flex items-center" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center space-x-1 px-1 sm:px-2 py-2 text-xs sm:text-base font-medium max-w-[80px] sm:max-w-none truncate text-dark dark:text-white`}
            >
              <div className="flex flex-col items-start">
                <span className="truncate">{session?.user?.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  {formatUserRole(session?.user?.role || '')}
                </span>
              </div>
              <svg
                className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 min-w-[10rem] w-max origin-top rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-dark-2 z-[200]">
                <div className="py-1">
                  {userNav.map((item) => {
                    // Skip agent-only items if user is not an agent
                    if (item.agentOnly && session?.user?.role !== "AGENT") {
                      return null;
                    }
                    
                    // Skip items that should be hidden for agents
                    if (item.hideForAgent && session?.user?.role === "AGENT") {
                      return null;
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  <hr className="my-1 border-gray-200 dark:border-dark-3" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <header
      className={`fixed left-0 top-0 z-40 w-full bg-white shadow-sm dark:shadow-dark-sm dark:bg-dark-2 transition-all duration-300 ease-linear`}
    >
      <div className="flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center">
          {/* Sidebar toggle button (mobile only) */}
          {isUserRoute && (
            <button
              type="button"
              onClick={() => updateSidebarOpen(!sidebarOpen)}
              className="mr-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 sm:mr-4 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          {/* Brand logo */}
          <div className="flex-shrink-0">
            <Logo link="/" />
          </div>
        </div>
        <div className="flex w-full items-center justify-end">
          {/* Desktop menu */}
          {!isUserRoute && !isAgentRoute && (
            <nav className="hidden pr-4 lg:flex">
              <ul className="flex gap-x-12">
                {menuData.filter((menuItem) => menuItem.hidden !== true).map((menuItem, index) => (
                  <li key={index} className="group relative">
                    {menuItem.submenu ? (
                      <>
                        <button
                          type="button"
                          className={`ud-menu-scroll flex items-center py-2 text-base text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6 ${
                            pathUrl === menuItem?.path && "text-primary"
                          }`}
                        >
                          {menuIcons[menuItem.title]}
                          {menuItem.title}
                          <svg className="ml-1 h-4 w-4 shrink-0 self-center" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <ul className="absolute left-0 top-full z-20 hidden min-w-[180px] rounded-md bg-white py-2 shadow-lg group-hover:block dark:bg-dark-2">
                          {menuItem.submenu.map((sub, subIdx) => (
                            <li key={subIdx}>
                              <Link
                                href={sub.path || '#'}
                                className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"
                              >
                                {menuIcons[sub.title]}
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={menuItem.path || '#'}
                        className={`ud-menu-scroll flex items-center py-2 text-base text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6 ${
                          pathUrl === menuItem?.path && "text-primary"
                        }`}
                      >
                        {menuIcons[menuItem.title]}
                        {menuItem.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile/Shared Controls */}
            {/* theme toggler */}
            <button
              aria-label="theme toggler"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center text-gray-800 dark:text-white"
            >
              <span>
                {/* Moon icon - shown in light mode */}
                <svg
                  viewBox="0 0 16 16"
                  className="h-[22px] w-[22px] fill-current dark:hidden"
                >
                  <path d="M4.50663 3.2267L3.30663 2.03337L2.36663 2.97337L3.55996 4.1667L4.50663 3.2267ZM2.66663 7.00003H0.666626V8.33337H2.66663V7.00003ZM8.66663 0.366699H7.33329V2.33337H8.66663V0.366699V0.366699ZM13.6333 2.97337L12.6933 2.03337L11.5 3.2267L12.44 4.1667L13.6333 2.97337ZM11.4933 12.1067L12.6866 13.3067L13.6266 12.3667L12.4266 11.1734L11.4933 12.1067ZM13.3333 7.00003V8.33337H15.3333V7.00003H13.3333ZM7.99996 3.6667C5.79329 3.6667 3.99996 5.46003 3.99996 7.6667C3.99996 9.87337 5.79329 11.6667 7.99996 11.6667C10.2066 11.6667 12 9.87337 12 7.6667C12 5.46003 10.2066 3.6667 7.99996 3.6667ZM7.33329 14.9667H8.66663V13H7.33329V14.9667ZM2.36663 12.36L3.30663 13.3L4.49996 12.1L3.55996 11.16L2.36663 12.36Z" />
                </svg>
                {/* Sun icon - shown in dark mode */}
                <svg
                  viewBox="0 0 23 23"
                  className="hidden h-[30px] w-[30px] fill-current dark:block"
                >
                  <g clipPath="url(#clip0_40_125)">
                    <path d="M16.6111 15.855C17.591 15.1394 18.3151 14.1979 18.7723 13.1623C16.4824 13.4065 14.1342 12.4631 12.6795 10.4711C11.2248 8.47905 11.0409 5.95516 11.9705 3.84818C10.8449 3.9685 9.72768 4.37162 8.74781 5.08719C5.7759 7.25747 5.12529 11.4308 7.29558 14.4028C9.46586 17.3747 13.6392 18.0253 16.6111 15.855Z" />
                  </g>
                </svg>
              </span>
            </button>
            
            {/* User navigation - different for agents vs regular users */}
            {session?.user ? (
              <>
                {renderAgentNav()}
                {renderUserNav()}
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="hidden px-7 py-3 text-base font-medium text-gray-800 hover:opacity-70 dark:text-white sm:block"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="hidden rounded-lg bg-primary px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20 sm:block"
                >
                  Sign Up
                </Link>
              </>
            )}
            
            {/* Hamburger button - mobile only */}
            <button
              onClick={navbarToggleHandler}
              id="navbarToggler"
              aria-label="Mobile Menu"
              className="block lg:hidden ml-1 p-2 rounded focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6 text-dark dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {navbarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {navbarOpen && (
        <nav className="absolute top-full left-0 w-full bg-white dark:bg-dark-2 shadow-lg z-40 block lg:hidden">
          <ul className="flex flex-col py-4">
            {menuData.filter((menuItem) => menuItem.hidden !== true).map((menuItem, index) => (
              <li key={index} className="group relative">
                {menuItem.submenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSubmenu(index)}
                      className={`flex w-full items-center justify-between px-6 py-3 text-base text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary ${
                        pathUrl === menuItem?.path && "text-primary"
                      }`}
                    >
                      <span className="flex items-center">{menuIcons[menuItem.title]}{menuItem.title}</span>
                      <svg className={`ml-2 h-4 w-4 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {openIndex === index && (
                      <ul className="pl-6">
                        {menuItem.submenu.map((sub, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              href={sub.path || '#'}
                              onClick={navbarToggleHandler}
                              className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-3"
                            >
                              {menuIcons[sub.title]}
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={menuItem.path || '#'}
                    onClick={navbarToggleHandler}
                    className={`block px-6 py-3 text-base text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary ${
                      pathUrl === menuItem?.path && "text-primary"
                    }`}
                  >
                    {menuIcons[menuItem.title]}
                    {menuItem.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
