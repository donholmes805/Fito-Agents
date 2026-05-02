"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { businessService } from "@/services";
import { Business } from "@/types";

export default function CompanyProfilePage() {
  const { businessId, isTeamMember } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Business>>({
    name: "",
    website: "",
    email: "",
    phone: "",
    industry: "",
    description: "",
    serviceArea: "",
    businessHours: "",
    address: "",
  });

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const data = await businessService.getBusinessById(businessId!);
      if (data) {
        setBusiness(data);
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to load business:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || isTeamMember) return;

    setSaving(true);
    setMessage(null);

    try {
      await businessService.updateBusiness(businessId, formData);
      setMessage({ type: 'success', text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to update business:", err);
      setMessage({ type: 'error', text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Company Profile</h1>
          <p className="text-on-surface-variant text-sm">Manage your business identity and AI context.</p>
        </div>
        {isTeamMember && (
            <div className="px-4 py-2 bg-surface-container rounded-xl border border-outline-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">lock</span> Read Only
            </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-error/10 border-error/20 text-error"
        }`}>
          <span className="material-symbols-outlined text-lg">
            {message.type === 'success' ? "check_circle" : "error"}
          </span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-panel rounded-3xl p-8 rim-light space-y-8 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
             <span className="material-symbols-outlined text-secondary">business</span>
             <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">Core Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Business Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isTeamMember}
                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-secondary disabled:opacity-50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Website URL</label>
              <input
                required
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={isTeamMember}
                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-secondary disabled:opacity-50 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Contact Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isTeamMember}
                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-secondary disabled:opacity-50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Phone Number</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isTeamMember}
                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-secondary disabled:opacity-50 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Industry / Category</label>
            <select 
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                disabled={isTeamMember}
                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-secondary disabled:opacity-50 font-bold appearance-none"
            >
              <option value="Real Estate">Real Estate</option>
              <option value="SaaS / Software">SaaS / Software</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Legal Services">Legal Services</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Home Services">Home Services</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Short Business Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isTeamMember}
              rows={4}
              className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-secondary h-32 resize-none disabled:opacity-50 font-bold"
            />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 rim-light space-y-8 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
             <span className="material-symbols-outlined text-tertiary">location_on</span>
             <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">Logistics & Service</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Service Area</label>
                    <input
                        type="text"
                        name="serviceArea"
                        value={formData.serviceArea}
                        onChange={handleChange}
                        disabled={isTeamMember}
                        placeholder="e.g. Southern California, Nationwide, Worldwide"
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary disabled:opacity-50 font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Business Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isTeamMember}
                        placeholder="Suite or Full Address"
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary disabled:opacity-50 font-bold"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Business Hours</label>
                <textarea
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleChange}
                    disabled={isTeamMember}
                    rows={4}
                    placeholder="Mon-Fri 9-5, etc."
                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary h-full min-h-[140px] resize-none disabled:opacity-50 font-bold"
                />
            </div>
          </div>
        </div>

        {!isTeamMember && (
          <div className="pt-4 flex justify-end">
            <button 
                type="submit" 
                disabled={saving}
                className="btn-primary px-12 py-5 rounded-2xl flex items-center justify-center gap-3 min-w-[200px]"
            >
              {saving ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                  <>Save Profile <span className="material-symbols-outlined">save</span></>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
