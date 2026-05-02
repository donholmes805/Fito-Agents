"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { businessService } from "@/services";
import { Business } from "@/types";

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
  error: string | null;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { businessId, loading: authLoading } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = async () => {
    if (authLoading) return;
    
    if (!businessId) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getBusinessById(businessId);
      setBusiness(data);
    } catch (err: any) {
      console.error("Failed to load business context:", err);
      setError(err.message || "Failed to load business data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusiness();
  }, [businessId, authLoading]);

  return (
    <BusinessContext.Provider value={{ business, loading, error, refreshBusiness: loadBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
