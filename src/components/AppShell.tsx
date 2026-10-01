"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { logout } from "@/lib/actions";
import ThemeToggle from "@/components/ThemeToggle";
import { SIDEBAR_STORAGE_KEY } from "@/lib/preferences";
import {
    CloseIcon,
    DashboardIcon,
    DocumentIcon,
    LogoutIcon,
    MenuIcon,
    RoofIcon,
    SettingsIcon,
    SidebarIcon,
    UsersIcon,
} from "@/components/Icons";

const navGroups = [
    {
        title: "Workspace",
        items: [
            { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
            // New Report (/image-analysis) is reached from the Reports page, so it keeps Reports highlighted.
            { href: "/reports", label: "Reports", Icon: DocumentIcon, also: ["/image-analysis"] },
        ],
    },
    {
        title: "Tools",
        items: [{ href: "/roofing", label: "Roofing Report", Icon: RoofIcon }],
    },
    {
        title: "Admin",
        items: [
            { href: "/users", label: "Users", Icon: UsersIcon },
            { href: "/settings", label: "Settings", Icon: SettingsIcon },
        ],
    },
];

// <html data-sidebar="collapsed"> is the source of truth (set before paint by the
// layout script); CSS reads it directly, this hook only drives the toggle label.
function subscribeSidebar(onChange: () => void) {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sidebar"] });
    return () => observer.disconnect();
}

function useSidebarCollapsed() {
    return useSyncExternalStore(
        subscribeSidebar,
        () => document.documentElement.getAttribute("data-sidebar") === "collapsed",
        () => false
    );
}

function setSidebarCollapsed(collapsed: boolean) {
    const root = document.documentElement;
    if (collapsed) root.setAttribute("data-sidebar", "collapsed");
    else root.removeAttribute("data-sidebar");
    try {
        if (collapsed) localStorage.setItem(SIDEBAR_STORAGE_KEY, "collapsed");
        else localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    } catch {
        // Not persisted, still applied for this visit.
    }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const collapsed = useSidebarCollapsed();

    // Login is a standalone screen: no sidebar, no top bar.
    if (pathname?.startsWith("/login")) {
        return <>{children}</>;
    }

    const isActive = (href: string, also: string[] = []) =>
        [href, ...also].some((base) => pathname === base || pathname?.startsWith(`${base}/`));

    return (
        <div className="min-h-screen print:block">
            {/* Mobile backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden print:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-line bg-surface transition-transform duration-200 print:hidden ${
                    open ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="flex h-14 shrink-0 items-center border-b border-line px-3">
                    <Link
                        href="/dashboard"
                        className="sidebar-label whitespace-nowrap px-3 text-sm font-semibold tracking-tight"
                        onClick={() => setOpen(false)}
                    >
                        Report AI Analysis
                    </Link>
                    <button
                        type="button"
                        onClick={() => setSidebarCollapsed(!collapsed)}
                        aria-label={collapsed ? "Pin sidebar open" : "Collapse sidebar"}
                        title={collapsed ? "Pin sidebar open" : "Collapse sidebar"}
                        className="ml-auto hidden rounded-md px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-fg/50 lg:block"
                    >
                        <SidebarIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="ml-auto rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
                        aria-label="Close menu"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.title} className={groupIndex > 0 ? "mt-6" : ""}>
                            <p className="sidebar-label mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                                {group.title}
                            </p>
                            {groupIndex > 0 && <div className="sidebar-rule mx-3 mb-3 border-t border-line" />}
                            <ul className="space-y-0.5">
                                {group.items.map(({ href, label, Icon, also }) => {
                                    const active = isActive(href, also);
                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                onClick={() => setOpen(false)}
                                                aria-current={active ? "page" : undefined}
                                                className={`relative flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-fg/50 ${
                                                    active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
                                                }`}
                                            >
                                                {active && (
                                                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />
                                                )}
                                                <Icon className={`shrink-0 ${active ? "text-accent" : ""}`} />
                                                <span className="sidebar-label">{label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="app-main">
                {/* Top bar: menu toggle on mobile, Logout is the only item outside the sidebar */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6 print:hidden">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </button>
                    <div className="ml-auto flex items-center gap-3">
                        <ThemeToggle />
                        <form action={logout}>
                            <button type="submit" className="btn-secondary px-3 py-1.5 text-danger">
                                <LogoutIcon width={16} height={16} />
                                Logout
                            </button>
                        </form>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8 print:max-w-none print:p-0">{children}</main>
            </div>
        </div>
    );
}
