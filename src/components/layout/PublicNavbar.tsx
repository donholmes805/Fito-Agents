"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services";

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, role, loading } = useAuth();

  const dashboardPath = authService.getRedirectPathForRole(role);

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-20 bg-background/80 backdrop-blur-xl border-b border-outline-variant shadow-2xl shadow-black/50 transition-all duration-300">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-black text-white font-heading tracking-tighter uppercase">
          Fito Agents
        </Link>
        <div className="hidden lg:flex gap-8 items-center">
          <Link
            href="/how-it-works"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-all"
          >
            How it Works
          </Link>
          <Link
            href="/agent-types"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-all"
          >
            Agent Types
          </Link>
          <Link
            href="/pricing"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-all"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-all"
          >
            Contact
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {!loading && (
            <div className="hidden sm:flex items-center gap-2">
                {isAuthenticated ? (
                    <Link href={dashboardPath} className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-secondary/10 flex items-center gap-2">
                        Dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-white px-6 py-3 transition-all"
                        >
                            Login
                        </Link>
                        <Link href="/register" className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-secondary/10">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        )}
        
        {/* Mobile Menu Toggle */}
        <button 
            className="lg:hidden p-2 text-on-surface-variant hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-surface-container-high border-b border-outline-variant p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
              <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">How it Works</Link>
              <Link href="/agent-types" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Agent Types</Link>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Pricing</Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Contact</Link>
              <hr className="border-outline-variant" />
              {!loading && (
                <div className="flex flex-col gap-4">
                    {isAuthenticated ? (
                        <Link href={dashboardPath} onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-center py-4 uppercase tracking-widest text-xs font-bold">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center py-4">Login</Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-center py-4">Get Started</Link>
                        </>
                    )}
                </div>
              )}
          </div>
      )}
    </nav>
  );
}
