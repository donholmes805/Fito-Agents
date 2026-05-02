"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const sidebarItems = [
  { name: "Overview", icon: "dashboard", href: "/dashboard" },
  { name: "Company Profile", icon: "business", href: "/dashboard/company" },
  { name: "Agent Builder", icon: "smart_toy", href: "/dashboard/agent-builder" },
  { name: "Knowledge Base", icon: "menu_book", href: "/dashboard/knowledge-base" },
  { name: "Leads", icon: "person_add", href: "/dashboard/leads" },
  { name: "Conversations", icon: "forum", href: "/dashboard/conversations" },
  { name: "Embed & Share", icon: "code", href: "/dashboard/embed" },
  { name: "Billing", icon: "payments", href: "/dashboard/billing" },
  { name: "Settings", icon: "settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout, isTeamMember } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (isTeamMember) {
      return !["Billing", "Settings"].includes(item.name);
    }
    return true;
  });

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    
    // Extra security for team members
    if (isTeamMember && (pathname.includes("/billing") || pathname.includes("/settings"))) {
        router.push("/dashboard");
    }
  }, [pathname, isTeamMember, router]);

  return (
    <ProtectedRoute allowedRoles={["business_owner", "team_member", "owner", "admin"]}>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex bg-surface-container-lowest border-r border-outline-variant flex-col transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && <span className="text-xl font-black text-white font-heading tracking-tighter uppercase">Fito</span>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">{isSidebarOpen ? "menu_open" : "menu"}</span>
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? "bg-secondary-container text-on-secondary-container shadow-lg shadow-blue-900/20" : "text-on-surface-variant hover:bg-surface-container hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-outline-variant">
            <div className={`bg-surface-container-high rounded-2xl p-4 flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary-fixed text-xs font-bold">
                {userProfile?.displayName?.charAt(0) || "U"}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-on-surface truncate">{userProfile?.displayName || "User"}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{userProfile?.role?.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="relative w-72 bg-surface-container-lowest h-full flex flex-col border-r border-outline-variant animate-in slide-in-from-left duration-300">
              <div className="p-6 flex items-center justify-between border-b border-outline-variant">
                <span className="text-xl font-black text-white font-heading uppercase">Fito Agents</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {filteredSidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                        isActive ? "bg-secondary-container text-on-secondary-container shadow-xl" : "text-on-surface-variant"
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
          {/* Top Bar */}
          <header className="h-20 border-b border-outline-variant bg-background/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-on-surface-variant">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-lg font-bold text-on-surface hidden sm:block">
                {filteredSidebarItems.find(i => i.href === pathname)?.name || "Dashboard"}
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold border border-secondary/20 uppercase tracking-widest hidden md:inline-block">Business Plan</span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold border border-tertiary/20 uppercase tracking-widest">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="hidden md:flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">business</span>
                  <p className="text-xs font-bold uppercase tracking-widest truncate max-w-[120px]">Acme Corp</p>
              </div>
              <div className="flex items-center gap-4">
                  <button className="text-on-surface-variant hover:text-white relative p-2 bg-surface-container rounded-xl border border-outline-variant transition-all">
                    <span className="material-symbols-outlined text-sm">notifications</span>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error rounded-full"></span>
                  </button>
                  <div className="h-8 w-px bg-outline-variant mx-1"></div>
                  <button 
                    onClick={() => logout()}
                    className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant overflow-hidden hover:text-error transition-colors"
                  >
                      <span className="material-symbols-outlined">logout</span>
                  </button>
              </div>
            </div>
          </header>

          {/* Page Body */}
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
