"use client";

import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function SalesPartnerInfoPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PublicNavbar />

      <main className="flex-grow pt-32 pb-24 px-gutter">
        {/* Header Section */}
        <section className="max-w-4xl mx-auto mb-16 text-center no-print">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 mb-8">
            <span className="material-symbols-outlined text-secondary text-sm">description</span>
            <span className="text-[10px] font-heading font-semibold text-secondary uppercase tracking-wider">
              Sales Partner Information Packet
            </span>
          </div>
          <h1 className="font-heading text-5xl font-bold text-on-surface leading-tight mb-6">
            Partnering for <span className="text-secondary">AI Innovation</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed mb-10">
            This document outlines everything you need to know about representing Fito Agents as a Sales Partner.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={handlePrint}
              className="bg-surface-container border border-outline-variant text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-variant transition-all"
            >
              <span className="material-symbols-outlined">print</span>
              Print Packet
            </button>
            <Link href="/sales-partners" className="btn-gradient px-8 py-4 rounded-xl">
              Apply Now
            </Link>
          </div>
        </section>

        {/* Content Section */}
        <article className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-16 rim-light print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          
          <div className="space-y-16">
            {/* 1. What Fito Agents Is */}
            <section id="about">
              <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">1</span>
                What is Fito Agents?
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed print:text-black">
                <p>
                  Fito Agents is an AI agent platform developed by Fito Technology, LLC. We empower businesses to deploy custom AI-powered digital workers that live on their websites and other digital channels.
                </p>
                <p>
                  Our agents go beyond simple chatbots. They are trained on a business’s specific knowledge base to answer customer questions, capture high-quality leads, provide 24/7 support, and automate routine business tasks.
                </p>
              </div>
            </section>

            {/* 2. What Sales Partners Sell */}
            <section id="offerings">
              <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">2</span>
                What Sales Partners Sell
              </h2>
              <p className="text-on-surface-variant mb-6 print:text-black">Sales Partners represent the Fito Agents platform to businesses that require:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Website AI Chat Assistants",
                  "Automated Lead Capture Systems",
                  "24/7 Customer Support Automation",
                  "WordPress AI Chat Plugins",
                  "Hosted AI Agent Landing Pages",
                  "Business Knowledge-Base Training"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant print:border-slate-200 print:text-black">
                    <span className="material-symbols-outlined text-secondary text-sm no-print">check_circle</span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Ideal Customers */}
            <section id="customers">
              <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">3</span>
                Ideal Customers
              </h2>
              <p className="text-on-surface-variant mb-6 print:text-black">Look for businesses that receive frequent questions or need to capture leads around the clock:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Local Service Businesses", "Real Estate Agents", "Consultants", "Cleaning Companies",
                  "Barbershops & Salons", "Nonprofits", "Schools & Training Centers", "Repair Companies",
                  "E-commerce Sites", "WordPress Site Owners", "Marketing Agencies"
                ].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-secondary/10 border border-secondary/20 text-secondary rounded-full text-xs font-bold print:border-slate-200 print:text-black">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* 4. Packages */}
            <section id="pricing">
              <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">4</span>
                Product Packages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant print:border-slate-200 print:text-black">
                  <h3 className="font-bold text-white mb-2 print:text-black">Starter Agent</h3>
                  <p className="text-2xl font-heading font-bold text-secondary mb-1">$49/mo</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">+$299 Setup</p>
                  <p className="text-xs text-on-surface-variant">Essential features for small businesses and individuals.</p>
                </div>
                <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/30 print:border-slate-200 print:text-black">
                  <h3 className="font-bold text-white mb-2 print:text-black">Business Agent</h3>
                  <p className="text-2xl font-heading font-bold text-secondary mb-1">$149/mo</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">+$999 Setup</p>
                  <p className="text-xs text-on-surface-variant">The standard for growing businesses with high traffic.</p>
                </div>
                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant print:border-slate-200 print:text-black">
                  <h3 className="font-bold text-white mb-2 print:text-black">Advanced Agent</h3>
                  <p className="text-2xl font-heading font-bold text-secondary mb-1">Custom</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">+$2,500+ Setup</p>
                  <p className="text-xs text-on-surface-variant">Enterprise-grade integrations and custom workflows.</p>
                </div>
              </div>
            </section>

            {/* 5. Commission Policy */}
            <section id="commissions">
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant print:bg-slate-50 print:border-slate-200">
                <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                  <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">5</span>
                  Commission Policy
                </h2>
                <div className="space-y-6 text-on-surface-variant leading-relaxed print:text-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-3xl font-heading font-bold text-white print:text-black">30%</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-secondary">Setup Fee Commission</p>
                      <p className="text-sm">Earn 30% of the one-time activation fee on the first sale.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-heading font-bold text-white print:text-black">15%</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-secondary">Recurring Commission</p>
                      <p className="text-sm">Earn 15% monthly for up to 12 months per active account.</p>
                    </div>
                  </div>
                  <div className="mt-8 p-6 bg-surface-container-low rounded-xl border border-outline-variant text-sm print:text-black print:border-slate-200">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary text-lg">info</span>
                        <span>Commission applies only to active, paid, non-refunded customers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-error text-lg">cancel</span>
                        <span>No commission is earned on canceled, failed, refunded, free, test, owner-override, or unpaid accounts.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-tertiary text-lg">schedule</span>
                        <span>Payouts are reviewed monthly after customer payments clear.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs italic opacity-70">
                        <span className="material-symbols-outlined text-lg">gavel</span>
                        <span>Final approval, payout timing, and eligibility are determined by Fito Technology, LLC.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 6 & 7. Talking Points & Restrictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section id="dos">
                <h2 className="text-xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  What to Say
                </h2>
                <ul className="space-y-4 text-sm text-on-surface-variant print:text-black">
                  <li>• "Fito Agents help answer customer questions 24/7 without staff."</li>
                  <li>• "The AI captures leads directly from your website visitors."</li>
                  <li>• "Easy installation via script or WordPress plugin."</li>
                  <li>• "You get a dashboard for leads, conversations, and analytics."</li>
                  <li>• "Responses are trained on your specific business knowledge."</li>
                </ul>
              </section>
              <section id="donts">
                <h2 className="text-xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                  <span className="material-symbols-outlined text-error">cancel</span>
                  What NOT to Promise
                </h2>
                <ul className="space-y-4 text-sm text-on-surface-variant print:text-black">
                  <li>• No guaranteed sales or lead volumes.</li>
                  <li>• Do not claim the AI is "perfect" or error-free.</li>
                  <li>• Do not replace professional advice (legal, medical, etc).</li>
                  <li>• NEVER collect payments directly from customers.</li>
                  <li>• No unauthorized discounts or "deals."</li>
                  <li>• No spamming or cold-calling harassing businesses.</li>
                </ul>
              </section>
            </div>

            {/* 8. Sales Process */}
            <section id="process">
              <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">8</span>
                The Sales Process
              </h2>
              <div className="space-y-4">
                {[
                  "Find an interested business owner or decision maker.",
                  "Explain how Fito Agents solves their support or lead-gen pain.",
                  "Send them the pricing and package details.",
                  "Direct the customer to the Fito Agents website for signup or demo.",
                  "Manually submit your referral code (or partner name) for tracking.",
                  "The customer pays their invoice securely through Stripe.",
                  "Your commission eligibility is reviewed monthly."
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start print:text-black">
                    <span className="text-secondary font-bold font-heading">{idx + 1}.</span>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. Interview & KYC */}
            <section id="onboarding">
              <h2 className="text-2xl font-heading font-bold text-on-surface mb-6 flex items-center gap-3 print:text-black">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary no-print">9</span>
                Approval & Onboarding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant print:text-black print:border-slate-200">
                  <h4 className="font-bold mb-2">Application Review</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Apply through our website. Our team reviews your background and sales experience to ensure a good fit.</p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant print:text-black print:border-slate-200">
                  <h4 className="font-bold mb-2">Interview & KYC</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">If selected, you'll undergo a brief interview and a standard "Know Your Customer" identity verification process.</p>
                </div>
              </div>
            </section>

            {/* Footer / Contact */}
            <section className="pt-16 border-t border-outline-variant text-center print:text-black print:border-slate-200">
              <p className="text-sm text-on-surface-variant mb-4">Questions? Reach out to our partner support team.</p>
              <p className="font-heading font-bold text-white print:text-black">partners@fitoagents.com</p>
              <div className="mt-8 no-print">
                <Link href="/sales-partners" className="btn-gradient px-12 py-5 rounded-2xl font-bold">
                  Start Your Application
                </Link>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-12 uppercase tracking-[0.3em]">
                © 2024 Fito Technology, LLC. All Rights Reserved.
              </p>
            </section>
          </div>
        </article>
      </main>

      <PublicFooter />

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .glass-panel {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          .rim-light::before {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
