import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black font-heading text-white uppercase tracking-tighter mb-4">Refund Policy</h1>
          <p className="text-on-surface-variant mb-12">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-a:text-secondary max-w-none">
            <p>Thank you for subscribing to Fito Agents. We want to ensure you have a great experience with our AI agents.</p>
            
            <h2>1. Subscription Cancellations</h2>
            <p>You can cancel your subscription at any time. Your cancellation will take effect at the end of the current paid term. You can manage your subscription directly from your dashboard under the "Billing" section.</p>

            <h2>2. Refund Eligibility</h2>
            <p>We offer a 14-day money-back guarantee for all new subscriptions. If you are not satisfied with Fito Agents within the first 14 days of your initial purchase, you are eligible for a full refund.</p>

            <h2>3. Setup Fees</h2>
            <p>Any one-time setup fees (e.g., custom integrations or white-glove onboarding) are non-refundable once the setup process has begun.</p>

            <h2>4. Usage Overages</h2>
            <p>Charges incurred due to exceeding your plan's message limits are non-refundable as they represent direct compute costs incurred on your behalf.</p>

            <h2>5. Requesting a Refund</h2>
            <p>To request a refund within the eligible period, please contact our support team at <a href="mailto:support@fitoagents.com">support@fitoagents.com</a> with your account email and reason for the refund.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
