import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black font-heading text-white uppercase tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-on-surface-variant mb-12">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-a:text-secondary max-w-none">
            <p>At Fito Agents, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI agent services.</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us when you register for an account, create AI agents, or communicate with us. This may include your name, email address, billing information, and the training data you provide for your agents.</p>
            <p>We also collect information about the interactions between end-users and your deployed AI agents, including chat logs, IP addresses, and browser details, strictly for the purpose of providing and improving the service.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Provide, maintain, and improve our services.</li>
                <li>Process transactions and send related information.</li>
                <li>Send technical notices, updates, security alerts, and support messages.</li>
                <li>Respond to your comments, questions, and requests.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            </ul>

            <h2>3. AI Model Training & Data Usage</h2>
            <p>Your specific business data, uploaded documents, and chat logs are isolated and used <strong>only</strong> to power your individual agents. We do not use your private business data to train our foundational models across other accounts.</p>

            <h2>4. Sharing of Information</h2>
            <p>We do not sell your personal data. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., payment processing via Stripe, LLM inference via OpenRouter).</p>

            <h2>5. Data Security</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>

            <h2>6. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:hello@fitoagents.com">hello@fitoagents.com</a>.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
