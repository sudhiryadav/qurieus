"use client";

import { useLayoutEffect, useRef, useState, type JSX } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle2,
  Percent,
  Clock,
  Menu,
  X,
  Home,
  Info,
  DollarSign,
  Phone,
  BookOpen,
  Users,
  Briefcase,
  Layers,
  Rocket,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Logo from "@/components/Common/Logo";
import menuData from "@/components/Header/menuData";
import { adminNav, userNav } from "@/components/Sidebar";

const DEMO_NAME = "Alex Johnson";

/** Design canvas width; scale = container width / this value */
const PREVIEW_CANVAS_WIDTH = 1200;
/** Unscaled approximate height (header + dashboard body) for layout reservation */
const PREVIEW_CANVAS_HEIGHT = 580;

const previewMenuIcons: Record<string, JSX.Element> = {
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

function formatUserRole(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "USER":
      return "User";
    case "AGENT":
      return "Agent";
    default:
      return role;
  }
}

const kpiCards = [
  {
    label: "Total Queries",
    value: "2,847",
    Icon: MessageSquare,
    wrap: "bg-blue-50 text-[#3758F9] dark:bg-primary/15 dark:text-primary",
  },
  {
    label: "Successful Queries",
    value: "2,793",
    Icon: CheckCircle2,
    wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    label: "Success Rate",
    value: "98.1%",
    Icon: Percent,
    wrap: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
  {
    label: "Avg Response Time",
    value: "412ms",
    Icon: Clock,
    wrap: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
] as const;

const weekly = [
  { day: "Mon", count: 42 },
  { day: "Tue", count: 68 },
  { day: "Wed", count: 55 },
  { day: "Thu", count: 94 },
  { day: "Fri", count: 73 },
];

const trending = [
  { label: "Return policy wording", v: 18 },
  { label: "API integration", v: 14 },
  { label: "Billing & invoices", v: 22 },
  { label: "Security / SOC2", v: 17 },
];

const recent = [
  {
    date: "May 16, 2026 10:24 AM",
    status: "Successful Query",
    query: "What is your return policy for enterprise accounts?",
  },
  {
    date: "May 16, 2026 9:58 AM",
    status: "Successful Query",
    query: "How do I embed the widget on a Next.js site?",
  },
  {
    date: "May 16, 2026 9:12 AM",
    status: "Successful Query",
    query: "Summarize the onboarding PDF for new hires.",
  },
];

function BarChartPreview() {
  const max = Math.max(...weekly.map((w) => w.count), 1);
  const pixelMax = 112;
  return (
    <div className="flex h-[140px] items-end gap-3 border-b border-gray-200 px-2 pb-0 pt-4 dark:border-dark-3">
      {weekly.map(({ day, count }) => {
        const h = Math.max(Math.round((count / max) * pixelMax), 10);
        return (
          <div key={day} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-[40px] rounded-t bg-[#3758F9] dark:bg-primary"
              style={{ height: `${h}px` }}
            />
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineChartPreview() {
  const vals = trending.map((t) => t.v);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = Math.max(max - min, 1);
  const w = 240;
  const h = 100;
  const pad = 8;
  const pts = trending.map((t, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(trending.length - 1, 1);
    const y = pad + (h - pad * 2) * (1 - (t.v - min) / range);
    return `${x},${y}`;
  });
  const d = `M ${pts.join(" L ")}`;
  return (
    <svg className="w-full text-[10px]" viewBox={`0 0 ${w} ${h + 56}`} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke="#10b981"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:stroke-emerald-400"
      />
      {trending.map((t, i) => {
        const x = pad + (i * (w - pad * 2)) / Math.max(trending.length - 1, 1);
        const y = pad + (h - pad * 2) * (1 - (t.v - min) / range);
        return <circle key={t.label} cx={x} cy={y} r={3} fill="#10b981" className="dark:fill-emerald-400" />;
      })}
      {trending.map((t, i) => {
        const cx = pad + (i * (w - pad * 2)) / Math.max(trending.length - 1, 1);
        const labelLines =
          t.label.length > 16 ? [t.label.slice(0, 16), t.label.slice(16)] : [t.label];
        return (
          <text
            key={`lab-${t.label}`}
            x={cx}
            y={h + 18}
            textAnchor="middle"
            fill="#64748b"
            className="select-none dark:fill-gray-400"
          >
            {labelLines.map((line, li) => (
              <tspan key={li} x={cx} dy={li === 0 ? 0 : 12}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

function InertDashboardChrome({
  displayName,
  roleLine,
  showSignedOutCTAs,
}: {
  displayName: string;
  roleLine: string | null;
  showSignedOutCTAs: boolean;
}) {
  return (
    <header
      className="pointer-events-none flex h-16 w-full shrink-0 select-none items-center justify-between gap-2 bg-white px-2 shadow-sm transition-all duration-300 ease-linear dark:bg-dark-2 dark:shadow-dark-sm sm:px-4"
    >
      <div className="flex min-w-0 shrink-0 items-center">
        <span className="mr-1 text-gray-500 dark:text-gray-400 sm:mr-4" aria-hidden>
          <Menu className="h-6 w-6" />
        </span>
        <div className="flex-shrink-0">
          <Logo width={30} height={30} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end">
        <nav className="mr-1 min-w-0 pr-1 sm:mr-0 sm:pr-4">
          <ul className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-4 lg:gap-x-5">
            {menuData
              .filter((menuItem) => menuItem.hidden !== true)
              .map((menuItem, index) => (
                <li key={`${menuItem.title}-${index}`} className="group relative shrink-0">
                  {menuItem.submenu ? (
                    <span
                      className="ud-menu-scroll flex items-center whitespace-nowrap py-2 text-sm text-gray-800 group-hover:text-primary dark:text-white dark:group-hover:text-primary sm:text-base lg:inline-flex lg:px-0 lg:py-4"
                    >
                      {previewMenuIcons[menuItem.title]}
                      {menuItem.title}
                      <svg
                        className="ml-1 h-4 w-4 shrink-0 self-center"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className="ud-menu-scroll flex items-center whitespace-nowrap py-2 text-sm text-gray-800 group-hover:text-primary dark:text-white dark:group-hover:text-primary sm:text-base lg:inline-flex lg:px-0 lg:py-4"
                    >
                      {previewMenuIcons[menuItem.title]}
                      {menuItem.title}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center space-x-1 sm:space-x-2">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center text-gray-800 dark:text-white"
          >
            <span>
              <svg
                viewBox="0 0 16 16"
                className="h-[22px] w-[22px] fill-current dark:hidden"
              >
                <path d="M4.50663 3.2267L3.30663 2.03337L2.36663 2.97337L3.55996 4.1667L4.50663 3.2267ZM2.66663 7.00003H0.666626V8.33337H2.66663V7.00003ZM8.66663 0.366699H7.33329V2.33337H8.66663V0.366699V0.366699ZM13.6333 2.97337L12.6933 2.03337L11.5 3.2267L12.44 4.1667L13.6333 2.97337ZM11.4933 12.1067L12.6866 13.3067L13.6266 12.3667L12.4266 11.1734L11.4933 12.1067ZM13.3333 7.00003V8.33337H15.3333V7.00003H13.3333ZM7.99996 3.6667C5.79329 3.6667 3.99996 5.46003 3.99996 7.6667C3.99996 9.87337 5.79329 11.6667 7.99996 11.6667C10.2066 11.6667 12 9.87337 12 7.6667C12 5.46003 10.2066 3.6667 7.99996 3.6667ZM7.33329 14.9667H8.66663V13H7.33329V14.9667ZM2.36663 12.36L3.30663 13.3L4.49996 12.1L3.55996 11.16L2.36663 12.36Z" />
              </svg>
              <svg
                viewBox="0 0 23 23"
                className="hidden h-[30px] w-[30px] fill-current dark:block"
              >
                <g clipPath="url(#heroDashPreviewSunClip)">
                  <path d="M16.6111 15.855C17.591 15.1394 18.3151 14.1979 18.7723 13.1623C16.4824 13.4065 14.1342 12.4631 12.6795 10.4711C11.2248 8.47905 11.0409 5.95516 11.9705 3.84818C10.8449 3.9685 9.72768 4.37162 8.74781 5.08719C5.7759 7.25747 5.12529 11.4308 7.29558 14.4028C9.46586 17.3747 13.6392 18.0253 16.6111 15.855Z" />
                </g>
                <defs>
                  <clipPath id="heroDashPreviewSunClip">
                    <rect width="23" height="23" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </span>

          {showSignedOutCTAs ? (
            <>
              <span className="hidden px-7 py-3 text-base font-medium text-gray-800 dark:text-white sm:block">
                Sign In
              </span>
              <span className="hidden rounded-lg bg-primary px-6 py-3 text-base font-medium text-white duration-300 ease-in-out dark:bg-white/10 dark:text-white sm:inline-block">
                Sign Up
              </span>
            </>
          ) : (
            <div className="flex items-center">
              <div className="flex max-w-[72px] items-center space-x-1 px-1 py-2 text-[10px] font-medium text-dark sm:max-w-none sm:space-x-2 sm:px-2 sm:text-xs md:text-base dark:text-white">
                <div className="flex flex-col items-start truncate">
                  <span className="truncate">{displayName}</span>
                  {roleLine ? (
                    <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400 sm:text-xs">
                      {roleLine}
                    </span>
                  ) : null}
                </div>
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroPreviewSidebar({
  role,
  loggedIn,
}: {
  role: string | undefined;
  loggedIn: boolean;
}) {
  const showAdminSection =
    loggedIn && (role === "ADMIN" || role === "SUPER_ADMIN");

  const visibleAdminNav = showAdminSection
    ? adminNav.filter(
        (item) =>
          !("superAdminOnly" in item && item.superAdminOnly) ||
          role === "SUPER_ADMIN"
      )
    : [];

  return (
    <aside className="pointer-events-none flex w-72 shrink-0 select-none flex-col overflow-y-auto border-r border-gray-200 bg-white duration-300 ease-linear dark:border-dark-3 dark:bg-dark-2">
      <div className="flex items-center justify-end gap-2 px-6 pt-2 pr-2 py-5.5 lg:py-6.5">
        <span className="block lg:hidden" aria-hidden>
          <X className="h-6 w-6" />
        </span>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-0 px-2">
          {showAdminSection && visibleAdminNav.length > 0 ? (
            <div className="mb-2">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Admin
              </p>
              <div className="space-y-0.5">
                {visibleAdminNav.map((item) => (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-white"
                  >
                    {item.icon}
                    {item.name}
                  </div>
                ))}
              </div>
              <hr className="my-3 border-gray-200 dark:border-dark-3" />
            </div>
          ) : null}
          {userNav.map((item) => {
            if (item.agentOnly && role !== "AGENT") return null;
            if (item.hideForAgent && role === "AGENT") return null;
            const isActive = item.href === "/user/dashboard";
            return (
              <div
                key={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default function HeroDashboardPreview() {
  const { data: session } = useSession();
  const loggedIn = Boolean(session?.user);
  const displayName = session?.user?.name?.trim() || DEMO_NAME;
  const roleLine =
    loggedIn && session?.user?.role ? formatUserRole(session.user.role) : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.getBoundingClientRect().width;
      if (containerWidth <= 0) return;

      const contentWidth = Math.max(
        canvas?.scrollWidth ?? PREVIEW_CANVAS_WIDTH,
        PREVIEW_CANVAS_WIDTH
      );
      const nextScale = Math.min(1, containerWidth / contentWidth);
      setScale((prev) =>
        Math.abs(prev - nextScale) < 0.001 ? prev : nextScale
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    if (canvas) observer.observe(canvas);
    return () => observer.disconnect();
  }, [loggedIn, session?.user?.role]);

  const scaledHeight = PREVIEW_CANVAS_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-none border-0 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] outline-none ring-0 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      <div className="relative w-full" style={{ height: scaledHeight }}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: PREVIEW_CANVAS_WIDTH,
            transform: `scale(${scale})`,
          }}
        >
          <div ref={canvasRef} style={{ width: PREVIEW_CANVAS_WIDTH }}>
          <InertDashboardChrome
            displayName={displayName}
            roleLine={roleLine}
            showSignedOutCTAs={!loggedIn}
          />

          <div className="flex w-full max-w-full min-h-[480px] bg-gray-50 dark:bg-dark">
            <HeroPreviewSidebar
              loggedIn={loggedIn}
              role={session?.user?.role}
            />

            <main className="pointer-events-none min-w-0 flex-1 select-none overflow-hidden p-3 sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <LayoutDashboard className="h-6 w-6 shrink-0 text-[#3758F9] dark:text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              Welcome, {displayName}!
            </h2>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map(({ label, value, Icon, wrap }) => (
              <div
                key={label}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {label}
                  </p>
                  <span className={`flex shrink-0 rounded-lg p-1.5 ${wrap}`} aria-hidden>
                    <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Weekly Activity
              </h3>
              <BarChartPreview />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Trending Queries
              </h3>
              <div className="overflow-x-auto">
                <LineChartPreview />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-dark-2">
            <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] table-auto text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-3">
                    <th className="py-2 pr-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="py-2 pr-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="py-2 font-medium text-gray-500 dark:text-gray-400">Query</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.date} className="border-b border-gray-100 last:border-0 dark:border-dark-3">
                      <td className="whitespace-nowrap py-2.5 pr-3 text-gray-600 dark:text-gray-300">
                        {row.date}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600 dark:text-gray-300">{row.query}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </main>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
