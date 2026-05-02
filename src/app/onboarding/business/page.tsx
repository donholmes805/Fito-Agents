"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { businessService, userService } from "@/services";

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    email: user?.email || "",
    phone: "",
    industry: "",
    serviceArea: "",
    address: "",
    businessHours: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create Business
      const isPlatformOwner = userProfile?.role === "owner";
      const businessData = {
        ...formData,
        ...(isPlatformOwner ? {
          ownerOverride: true,
          plan: "free" as const,
          subscriptionStatus: "owner_override" as const,
          setupFeeStatus: "waived" as const,
          customPlan: "Owner Access"
        } : {})
      };
      
      const business = await businessService.createBusiness(user.uid, businessData);
      
      // 2. Link User to Business
      await userService.updateUserBusinessId(user.uid, business.id);
      
      // 3. Refresh Profile state
      await refreshUserProfile();
      
      // 4. Redirect to Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to create business profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white font-heading uppercase tracking-tighter mb-4">Set Up Your Business</h1>
          <p className="text-on-surface-variant max-w-md mx-auto">Tell us about your business so we can configure your AI agents properly.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
                <div 
                    key={s} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-secondary shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-surface-container"}`}
                ></div>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 lg:p-12 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-bold uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Business Name</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Acme Corp"
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Website URL</label>
                        <input
                            required
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://acme.com"
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Business Email</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="hello@acme.com"
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Business Phone</label>
                        <input
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Industry</label>
                    <select
                        required
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all font-bold appearance-none"
                    >
                        <option value="">Select Industry</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="SaaS / Software">SaaS / Software</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Legal Services">Legal Services</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Home Services">Home Services (Plumbing, HVAC, etc)</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 mt-4"
                >
                    Continue <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Service Area</label>
                        <input
                            type="text"
                            name="serviceArea"
                            value={formData.serviceArea}
                            onChange={handleChange}
                            placeholder="Global, USA, or City Name"
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Business Hours</label>
                        <input
                            type="text"
                            name="businessHours"
                            value={formData.businessHours}
                            onChange={handleChange}
                            placeholder="Mon-Fri 9am-5pm"
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Business Way, Suite 100"
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-1">Business Description</label>
                    <textarea
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe your services, key value propositions, and what you want your AI to know about you..."
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 font-bold resize-none"
                    ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-5 rounded-2xl bg-surface-container border border-outline-variant text-white font-bold uppercase tracking-widest text-[10px] hover:bg-surface-container-high transition-all"
                    >
                        Back
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-[2] btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Complete Setup <span className="material-symbols-outlined">check_circle</span></>
                        )}
                    </button>
                </div>
            </div>
          )}
        </form>

        <p className="text-center mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/50">
          Secure Infrastructure by Fito Technology, LLC
        </p>
      </div>
    </div>
  );
}
