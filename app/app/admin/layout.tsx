"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  UserRound,
  Bell,
  Menu,
  X,
} from "lucide-react";

import AuthGuard from "@/lib/core/AuthGuard";
import {
  getCurrentUser,
  getDatabaseCurrentUser,
  databaseLogout,
  isDatabaseAuth,
  logout,
  AuthUser,
} from "@/lib/core/authStore";

import { useEffect, useState } from "react";
import LegacyStorageMigration from "@/components/core/LegacyStorageMigration";

type WorkspaceNavItem = { label: string; href: string };

const navigationGroups: { label: string; items: WorkspaceNavItem[] }[] = [
  {
    label: "Studio",
    items: [
      { label: "Overview", href: "/app/admin" },
      { label: "Projects", href: "/app/admin/projects" },
      { label: "Clients", href: "/app/admin/clients" },
      { label: "Team", href: "/app/admin/team" },
      { label: "Tasks", href: "/app/admin/tasks" },
      { label: "Calendar", href: "/app/admin/calendar" },
      { label: "Messages", href: "/app/admin/messages" },
      { label: "Website Content", href: "/app/admin/website-projects" },
    ],
  },
  {
    label: "Project Delivery",
    items: [
      { label: "Construction OS", href: "/app/admin/construction" },
      { label: "Quantity & Cost Control", href: "/app/admin/quantity-cost" },
      { label: "Revit Connector 2027", href: "/app/admin/revit" },
      { label: "Site Intelligence", href: "/app/admin/site" },
      { label: "Approvals", href: "/app/admin/approvals" },
      { label: "Files", href: "/app/admin/files" },
      { label: "Transmittals", href: "/app/admin/files/transmittals" },
      { label: "Timesheets", href: "/app/admin/timesheets" },
      { label: "Reports", href: "/app/admin/reports" },
    ],
  },
  {
    label: "Operations & Finance",
    items: [
      { label: "Operations Hub", href: "/app/admin/operations-hub" },
      { label: "Operations OS", href: "/app/admin/operations" },
      { label: "Command Center", href: "/app/admin/command-center" },
      { label: "Finance", href: "/app/admin/finance" },
    ],
  },
  {
    label: "Intelligence & AI",
    items: [
      { label: "Intelligence", href: "/app/admin/intelligence" },
      { label: "Project Brain", href: "/app/admin/brain" },
      { label: "AI Studio OS", href: "/app/admin/ai" },
      { label: "AI Agents", href: "/app/admin/agents" },
      { label: "AI Actions", href: "/app/admin/agents/actions" },
      { label: "System Completeness", href: "/app/admin/completeness" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Notifications", href: "/app/admin/notifications" },
      { label: "Security", href: "/app/admin/security" },
      { label: "Settings", href: "/app/admin/settings" },
    ],
  },
];

const navigation = navigationGroups.flatMap((group) => group.items);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["Owner", "Manager"]}>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}

function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeNav = navigation
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const currentUser = isDatabaseAuth
          ? await getDatabaseCurrentUser()
          : getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      }
    };

    const refreshAlerts = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store", credentials: "include" });
        const data = await response.json().catch(() => ({}));
        if (response.ok && mounted) setUnreadNotifications(Number(data.unread || 0));
      } catch (error) {
        console.error(
          "Notification engine failed",
          error
        );
      }
    };

    void loadUser();
    void refreshAlerts();

    const onFocus = () => void refreshAlerts();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function handleLogout() {
    if (isDatabaseAuth) {
      await databaseLogout().catch(() => {});
    }

    logout();
    router.replace("/app/login");
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <LegacyStorageMigration />
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-hidden border-r border-white/10 bg-[#111111] p-5 lg:flex">
        {/* Approved primary brand mark: do not repeat the name as UI text. */}
        <div className="flex shrink-0 items-center border-b border-white/10 px-3 pb-5 pt-3">
          <Link href="/app/admin">
            <img
              src="/images/logo-mason-arc.png"
              alt="Mason & Arc"
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Workspace */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-6 [scrollbar-color:rgba(255,255,255,0.22)_transparent] [scrollbar-width:thin]">
          <p className="px-3 text-[9px] uppercase tracking-[0.25em] text-white/25">
            Workspace
          </p>

          <nav className="mt-5 space-y-7 pb-3" aria-label="Studio workspace">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/35">
                  {group.label}
                </p>
                <div className="mt-2 space-y-0.5">
                  {group.items.map((item) => {
                    const isNotifications = item.label === "Notifications";
                    const active = activeNav === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`group flex min-h-10 items-center justify-between rounded-md border-s-2 px-3 py-2.5 text-xs transition-colors ${active ? "border-[#4F6B7A] bg-white/[0.07] text-white" : "border-transparent text-white/55 hover:bg-white/[0.05] hover:text-white"}`}
                      >
                        <span className="flex items-center gap-3">
                          {isNotifications && <Bell size={13} aria-hidden="true" className="text-white/50" />}
                          <span>{item.label}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          {isNotifications && unreadNotifications > 0 && (
                            <span className="min-w-5 rounded-full border border-white/20 px-1.5 py-0.5 text-center text-[8px] text-white/80">
                              {unreadNotifications > 99 ? "99+" : unreadNotifications}
                            </span>
                          )}
                          <span aria-hidden="true" className="text-white/25 transition group-hover:text-white/70">→</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="shrink-0 border-t border-white/10 pt-4">
          {/* Client Portal */}
          <Link
            href="/app"
            className="flex items-center justify-between rounded-lg px-3 py-3 text-[10px] uppercase tracking-[0.15em] text-white/30 transition hover:bg-white/[0.05] hover:text-white"
          >
            Client Portal

            <span>↗</span>
          </Link>

          {/* Current User */}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                <UserRound
                  size={15}
                  className="text-white/50"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs text-white/70">
                  {user?.name || "Studio User"}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/25">
                  {user?.role || "User"}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/5 px-3 py-2.5 text-[10px] text-white/30 transition hover:bg-white/[0.05] hover:text-white"
            >
              <span>Logout</span>
              <LogOut size={13} />
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-4 sm:px-6 lg:hidden">
        <Link href="/app/admin">
          <img
            src="/images/logo-mason-arc.png"
            alt="Mason & Arc"
            className="h-7 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-workspace-navigation"
            aria-label={mobileMenuOpen ? "Close workspace menu" : "Open workspace menu"}
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            <span className="hidden sm:inline">Menu</span>
          </button>
          <Link
            href="/app/admin/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-white/10"
            aria-label="Notifications"
          >
            <Bell size={16} />

            {unreadNotifications > 0 && (
              <span className="absolute right-1 top-1 min-w-4 rounded-full border border-white/20 bg-[#111111] px-1 text-center text-[8px]">
                {unreadNotifications > 99
                  ? "99+"
                  : unreadNotifications}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mobile workspace navigation: the desktop sidebar is otherwise hidden. */}
      {mobileMenuOpen && (
        <section
          id="mobile-workspace-navigation"
          className="border-b border-white/10 bg-[#111111] px-4 py-4 lg:hidden"
        >
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-medium text-white/80">Workspace</p>
                <p className="mt-1 text-[10px] text-white/40">
                  {user?.name || "Studio User"} · {user?.role || "User"}
                </p>
              </div>
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-white/55"
              >
                Client portal ↗
              </Link>
            </div>
            <nav className="space-y-6" aria-label="Workspace navigation">
              {navigationGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-1 text-[9px] uppercase tracking-[0.2em] text-white/40">
                    {group.label}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={activeNav === item.href ? "page" : undefined}
                        className={`flex min-h-12 items-center rounded-lg border px-3 py-2 text-xs leading-4 transition-colors ${activeNav === item.href ? "border-[#4F6B7A] bg-white/10 text-white" : "border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white"}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="min-h-screen lg:pl-64">
        {children}
      </main>
    </div>
  );
}
