"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const adminSidebarItems = [
  { name: "Platform Overview", icon: "analytics", href: "/admin" },
  { name: "Customers", icon: "group", href: "/admin/customers" },
  { name: "Agents", icon: "smart_toy", href: "/admin/agents" },
  { name: "Conversations", icon: "forum", href: "/admin/conversations" },
  { name: "Leads", icon: "person_add", href: "/admin/leads" },
  { name: "Sales Partners", icon: "handshake", href: "/admin/sales-applications" },
  { name: "Partner Packet", icon: "description", href: "/admin/sales-partner-packet" },
  { name: "Billing", icon: "payments", href: "/admin/billing" },
  { name: "Usage", icon: "database", href: "/admin/usage" },
  { name: "API Settings", icon: "api", href: "/admin/api-settings" },
  { name: "Audit Logs", icon: "history", href: "/admin/audit-logs" },
  { name: "Settings", icon: "settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <div className="min-h-screen bg-[#0b0f10] flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex bg-black border-r border-outline-variant flex-col transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white font-heading uppercase tracking-tighter">Fito</span>
                  <span className="px-1.5 py-0.5 rounded bg-error text-[10px] font-bold text-white uppercase tracking-tighter">Admin</span>
              </div>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">{isSidebarOpen ? "menu_open" : "menu"}</span>
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {adminSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? "bg-error/10 text-error border border-error/20" : "text-on-surface-variant hover:bg-surface-container hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-outline-variant">
            <div className={`bg-surface-container-high rounded-2xl p-4 flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}>
              <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center text-white text-xs font-bold">
                {userProfile?.displayName?.charAt(0) || "A"}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-on-surface truncate">{userProfile?.displayName || "Admin"}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{userProfile?.role}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="relative w-72 bg-black h-full flex flex-col border-r border-outline-variant animate-in slide-in-from-left duration-300">
              <div className="p-6 flex items-center justify-between border-b border-outline-variant">
                  <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white font-heading uppercase">Fito</span>
                      <span className="px-1.5 py-0.5 rounded bg-error text-[10px] font-bold text-white uppercase tracking-tighter">Admin</span>
                  </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {adminSidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                        isActive ? "bg-error/10 text-error border border-error/20 shadow-xl" : "text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 border-b border-outline-variant bg-black flex items-center justify-between px-6 lg:px-10 z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-on-surface-variant">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-lg font-bold text-on-surface hidden sm:block">
                {adminSidebarItems.find(i => i.href === pathname)?.name || "Platform Admin"}
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold border border-tertiary/20 uppercase tracking-widest hidden md:inline-block">System Healthy</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold border border-secondary/20 uppercase tracking-widest">v1.2.4 Production</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">open_in_new</span> Business View
              </Link>
              <div className="h-8 w-px bg-outline-variant mx-2"></div>
              <button 
                onClick={() => logout()}
                className="text-on-surface-variant hover:text-error p-2 bg-surface-container rounded-xl border border-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
