"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, userProfile, loading, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not logged in
        router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && role === "business_owner" && !userProfile?.businessId && !pathname.includes("/onboarding")) {
        // Business owner hasn't set up a business yet
        router.push("/onboarding/business");
      } else if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Logged in but wrong role
        if (role === "business_owner" || role === "team_member") {
          router.push("/dashboard");
        } else if (role === "owner" || role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    }
  }, [isAuthenticated, loading, role, allowedRoles, router, redirectTo, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Initializing Security</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
