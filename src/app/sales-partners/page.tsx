"use client";

import { useState } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function SalesPartnersPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    salesExperience: "",
    industries: "",
    website: "",
    reason: "",
    commissionComfortable: false,
    agreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "salesApplications"), {
        ...formData,
        status: "new",
        createdAt: serverTimestamp(),
        interviewLink: "",
        kycLink: "",
        adminNotes: "",
        resumeUrl: "placeholder", // Placeholder as requested
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setError("Failed to submit application. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <PublicNavbar />
        <main className="flex-grow flex items-center justify-center pt-32 pb-24 px-gutter">
          <div className="max-w-2xl w-full glass-panel p-12 rounded-3xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-secondary text-4xl">check_circle</span>
            </div>
            <h1 className="font-heading text-4xl font-bold text-on-surface">Application Received!</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Thank you for your interest in becoming a Fito Agents Sales Partner. Our team will review your application and get back to you within 3-5 business days.
            </p>
            <div className="pt-8">
              <Link href="/" className="btn-gradient px-8 py-4 rounded-xl inline-block">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PublicNavbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-gutter text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[10px] font-heading font-semibold text-secondary uppercase tracking-wider">
              Join Our Network
            </span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-on-surface leading-tight mb-6">
            Become a Fito Agents <span className="text-secondary">Sales Partner</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
            Fito Agents is expanding! We're looking for motivated sales professionals to help businesses adopt the next generation of AI website agents. Earn competitive commissions while delivering future-proof technology.
          </p>
          <Link href="/sales-partner-info" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline transition-all">
            <span className="material-symbols-outlined text-sm">info</span>
            Review Sales Partner Information Packet
          </Link>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
              <p className="text-2xl font-heading font-bold text-white">30%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Setup Fee Commission</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
              <p className="text-2xl font-heading font-bold text-white">15%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Monthly Recurring</p>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section className="max-w-3xl mx-auto px-gutter">
          <div className="glass-panel rounded-3xl p-8 md:p-12 rim-light relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary/10 rounded-full blur-[100px] -z-10"></div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-center gap-3">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Full Name</label>
                  <input
                    required
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">City</label>
                  <input
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">State</label>
                  <input
                    required
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">LinkedIn or Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Sales Experience</label>
                <textarea
                  required
                  name="salesExperience"
                  value={formData.salesExperience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors resize-none"
                  placeholder="Tell us about your previous sales roles and successes..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Industries You Know Well</label>
                <input
                  required
                  type="text"
                  name="industries"
                  value={formData.industries}
                  onChange={handleChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                  placeholder="Real Estate, SaaS, Healthcare, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Why do you want to sell Fito Agents?</label>
                <textarea
                  required
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors resize-none"
                  placeholder="What excites you about our AI technology?"
                />
              </div>

              <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="commissionComfortable"
                    checked={formData.commissionComfortable}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    I am comfortable with a commission-based compensation structure.
                  </span>
                </label>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1 block mb-2">Resume Upload</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-container-lowest">
                    <span className="material-symbols-outlined text-on-surface-variant mb-2">upload_file</span>
                    <p className="text-sm text-on-surface-variant">Resume upload is currently disabled for security. Please provide a link to your resume or portfolio in the website field above.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    required
                    type="checkbox"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    I agree to the <Link href="/terms" className="text-secondary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>.
                  </span>
                </label>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full btn-gradient py-4 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <span className="material-symbols-outlined">send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
