"use client";

import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { billingService } from "@/services";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingPage() {
  const { user } = useAuth();
  const { business } = useBusiness();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelection = async (plan: any) => {
    if (!user) {
      router.push(`/register?plan=${plan.id}`);
      return;
    }

    if (!business) {
      router.push(`/onboarding/business?plan=${plan.id}`);
      return;
    }

    if (plan.id === 'advanced') {
      router.push("/contact?type=advanced");
      return;
    }

    try {
      setLoadingPlan(plan.id);
      const url = await billingService.createCheckoutSession(plan.id, business.id, user.uid);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-gutter mb-20 text-center">
          <h1 className="font-heading text-6xl font-black text-white mb-6 uppercase tracking-tighter">Choose Your Brain</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto font-medium">
            Scale your digital workforce with precision. Select a tier that matches your business complexity.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-gutter grid grid-cols-1 md:grid-cols-3 gap-8 mb-40 items-start">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-panel p-10 rounded-[2.5rem] rim-light flex flex-col relative transition-all duration-500 hover:-translate-y-2 ${
                plan.popular ? "border-secondary border-2 scale-105 shadow-2xl shadow-secondary/10 bg-gradient-to-br from-secondary/5 to-transparent" : "border-outline-variant"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-black/50">
                  Most Popular
                </div>
              )}
              <p className={`text-[11px] font-black uppercase tracking-widest mb-4 ${plan.popular ? "text-secondary" : "text-on-surface-variant"}`}>
                {plan.name}
              </p>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-heading font-black text-white">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">/mo</span>}
                </div>
                {plan.setup && (
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-2">+ {plan.setup} activation fee</p>
                )}
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4 text-sm font-medium text-on-surface">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.popular ? "bg-secondary/10 text-secondary" : "bg-tertiary/10 text-tertiary"}`}>
                        <span className="material-symbols-outlined text-[14px] font-black">check</span>
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelection(plan)}
                disabled={!!loadingPlan}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs ${
                  plan.popular
                    ? "bg-secondary text-on-secondary hover:brightness-110 shadow-lg shadow-secondary/20"
                    : "bg-surface-container border border-outline-variant text-white hover:bg-surface-variant"
                }`}
              >
                {loadingPlan === plan.id ? "Initializing..." : plan.ctaText}
              </button>
            </div>
          ))}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

const pricingPlans = [
  {
    id: "starter",
    name: "Starter Agent",
    price: "$49",
    setup: "$299",
    features: [
      "1 AI Agent",
      "Website embed",
      "Hosted agent page",
      "FAQ knowledge base",
      "Lead capture",
      "Conversation logs",
      "500 Monthly Messages",
    ],
    ctaText: "Get Started",
    popular: false,
  },
  {
    id: "business",
    name: "Business Agent",
    price: "$149",
    setup: "$999",
    features: [
      "Everything in Starter",
      "3,000 Monthly Messages",
      "Document uploads",
      "Services & Pricing Manager",
      "Custom tone and branding",
      "QR code support",
      "Priority support",
    ],
    ctaText: "Boost My Business",
    popular: true,
  },
  {
    id: "advanced",
    name: "Advanced Agent",
    price: "Custom",
    setup: "$2,500+",
    features: [
      "Everything in Business",
      "10,000+ Monthly Messages",
      "Calendar integration",
      "SMS & Voice agents",
      "CRM / Webhook integrations",
      "Internal staff agent",
      "Advanced analytics",
    ],
    ctaText: "Contact Sales",
    popular: false,
  },
];
