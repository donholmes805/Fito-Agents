"use client";

import Link from "next/link";

export default function AdminSalesPartnerPacket() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Admin Header - Hidden during print */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-3xl font-heading font-bold text-on-surface">Sales Partner Packet</h1>
          <p className="text-on-surface-variant">Internal copy of the partner information and guidelines.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handlePrint}
            className="bg-surface-container border border-outline-variant text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">print</span>
            Print Packet
          </button>
          <Link 
            href="/sales-partner-info" 
            target="_blank"
            className="bg-secondary/10 border border-secondary/20 text-secondary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/20 transition-all"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            View Public Version
          </Link>
        </div>
      </div>

      {/* Packet Content */}
      <article className="glass-panel rounded-3xl p-8 md:p-12 rim-light print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        <div className="space-y-12">
            <div className="border-b border-outline-variant pb-8 mb-8 print:border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-black text-white font-heading uppercase tracking-tighter print:text-black">Fito Agents</span>
                    <span className="px-1.5 py-0.5 rounded bg-error text-[10px] font-bold text-white uppercase tracking-tighter no-print">Admin Copy</span>
                </div>
                <h2 className="text-4xl font-heading font-bold text-white print:text-black">Sales Partner Guidelines</h2>
                <p className="text-on-surface-variant mt-2 print:text-black">Last Updated: May 2024</p>
            </div>

          {/* 1. What Fito Agents Is */}
          <section>
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">1. What is Fito Agents?</h3>
            <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed print:text-black">
              <p>Fito Agents is an AI agent platform by Fito Technology, LLC that helps businesses create custom AI website assistants for customer support, lead capture, service questions, and business automation.</p>
            </div>
          </section>

          {/* 2. What Sales Partners Sell */}
          <section>
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">2. What Sales Partners Sell</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-on-surface-variant print:text-black">
              <li>• Website AI chat</li>
              <li>• Lead capture</li>
              <li>• Customer support automation</li>
              <li>• WordPress AI widget</li>
              <li>• Hosted AI agent page</li>
              <li>• Business knowledge-base assistant</li>
            </ul>
          </section>

          {/* 3. Ideal Customers */}
          <section>
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">3. Ideal Customers</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "local service businesses", "real estate agents", "consultants", "cleaning companies",
                "barbershops/salons", "nonprofits", "schools/training companies", "repair companies",
                "ecommerce sites", "WordPress website owners", "agencies"
              ].map(c => (
                <span key={c} className="px-3 py-1 bg-surface-container border border-outline-variant rounded-lg text-xs print:border-slate-200">{c}</span>
              ))}
            </div>
          </section>

          {/* 4. Packages */}
          <section>
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">4. Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant print:border-slate-200">
                <p className="font-bold text-white text-xs print:text-black">Starter</p>
                <p className="text-lg font-bold text-secondary">$49/mo + $299 setup</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant print:border-slate-200">
                <p className="font-bold text-white text-xs print:text-black">Business</p>
                <p className="text-lg font-bold text-secondary">$149/mo + $999 setup</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant print:border-slate-200">
                <p className="font-bold text-white text-xs print:text-black">Advanced</p>
                <p className="text-lg font-bold text-secondary">$299/mo + $2,500+ setup</p>
              </div>
            </div>
          </section>

          {/* 5. Commission Policy */}
          <section className="bg-secondary/5 p-6 rounded-2xl border border-secondary/20 print:bg-slate-50">
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">5. Suggested Commission Policy</h3>
            <div className="space-y-4 text-sm text-on-surface-variant print:text-black">
              <p>Approved Sales Partners may earn:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5"></span>
                    <span><strong>30% of the setup fee</strong> on the first sale</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5"></span>
                    <span><strong>15% recurring monthly commission</strong> for up to 12 months</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5"></span>
                    <span>Commission applies only to active, paid, non-refunded customers.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5"></span>
                    <span>No commission is earned on canceled, failed, refunded, free, test, owner-override, or unpaid accounts.</span>
                </li>
                <li className="flex items-start gap-2 text-xs italic pt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 opacity-50"></span>
                    <span>Payouts reviewed monthly after payments clear. Final approval by Fito Technology, LLC.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-lg font-heading font-bold text-on-surface mb-4 print:text-black">6. What to Say</h3>
              <ul className="space-y-2 text-xs text-on-surface-variant print:text-black">
                <li>• Answer questions 24/7 without staff.</li>
                <li>• Capture leads automatically.</li>
                <li>• Install via script or WordPress.</li>
                <li>• Dashboard for leads & analytics.</li>
                <li>• Uses business's own knowledge base.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-heading font-bold text-on-surface mb-4 print:text-black">7. Forbidden Promises</h3>
              <ul className="space-y-2 text-xs text-on-surface-variant print:text-black">
                <li>• No guaranteed sales/lead volume.</li>
                <li>• AI is not "perfect."</li>
                <li>• Does not replace professional advice.</li>
                <li>• DO NOT collect payments directly.</li>
                <li>• No spamming.</li>
              </ul>
            </section>
          </div>

          <section>
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">8. Sales Process</h3>
            <ol className="space-y-2 text-xs text-on-surface-variant list-decimal list-inside print:text-black">
              <li>Find interested business</li>
              <li>Explain Fito Agents</li>
              <li>Send pricing/package info</li>
              <li>Send customer to Fito Agents signup/demo</li>
              <li>Submit referral/sales code manually</li>
              <li>Customer pays through Stripe</li>
              <li>Commission eligibility is reviewed monthly</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-heading font-bold text-on-surface mb-4 print:text-black">9. Interview & KYC Process</h3>
            <ul className="space-y-2 text-xs text-on-surface-variant print:text-black">
              <li>• Apply via Sales Partner page.</li>
              <li>• Initial application review.</li>
              <li>• Optional interview link sent.</li>
              <li>• KYC verification link for approved candidates.</li>
              <li>• Final approval before official sales start.</li>
            </ul>
          </section>
        </div>
      </article>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          aside, header {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
