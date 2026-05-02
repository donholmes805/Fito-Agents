import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black font-heading text-white uppercase tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-on-surface-variant mb-12">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-a:text-secondary max-w-none">
            <p>Welcome to Fito Agents. These Terms of Service govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms.</p>
            
            <h2>1. Use of Services</h2>
            <p>Fito Agents provides a platform for creating and deploying custom AI agents. You agree to use the services only for lawful purposes and in accordance with these Terms.</p>

            <h2>2. Account Responsibilities</h2>
            <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

            <h2>3. Acceptable Use Policy</h2>
            <p>You may not use our service to create AI agents that generate illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content. We reserve the right to suspend or terminate accounts that violate these guidelines.</p>

            <h2>4. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Fito Agents and its licensors. Your data and the training materials you provide remain your property.</p>

            <h2>5. Limitation of Liability</h2>
            <p>In no event shall Fito Agents, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h2>6. Subscriptions and Payments</h2>
            <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. Unless you cancel your subscription before the end of the applicable billing cycle, your subscription will automatically renew.</p>

            <h2>7. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:hello@fitoagents.com">hello@fitoagents.com</a>.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
