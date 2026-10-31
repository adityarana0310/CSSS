"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Sparkles, 
  LayoutDashboard, 
  Bell, 
  Calendar as CalendarIcon, 
  FileText, 
  Settings, 
  LogOut,
  PlusCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface SidebarProps {
  onOpenCreateModal?: () => void;
}

export function DashboardSidebar({ onOpenCreateModal }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Announcements", href: "/announcements", icon: Bell },
    { label: "Calendar", href: "/calendar", icon: CalendarIcon },
    { label: "AI Weekly Digest", href: "/digest", icon: Sparkles },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Campus Pulse
            </span>
          </Link>
          {isMobileOpen && (
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-500">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Action */}
        <div className="px-2">
          <Button
            onClick={() => {
              if (onOpenCreateModal) onOpenCreateModal();
              setIsMobileOpen(false);
            }}
            size="sm"
            className="w-full justify-start gap-2 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add Announcement
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800 px-2 space-y-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">Campus Pulse</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 shadow-xl">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 shrink-0 min-h-screen">
        {navContent}
      </aside>
    </>
  );
}

