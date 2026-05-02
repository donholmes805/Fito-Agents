import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black font-heading text-white uppercase tracking-tighter mb-4">Contact Us</h1>
          <p className="text-on-surface-variant mb-12 text-lg">We're here to help you build and scale your AI workforce.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <span className="material-symbols-outlined text-2xl">mail</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-heading uppercase tracking-tight">Email Support</h2>
              <p className="text-on-surface-variant mb-4 text-sm leading-relaxed">
                For general inquiries, billing questions, or technical support, please reach out to our team.
              </p>
              <a href="mailto:hello@fitoagents.com" className="text-secondary font-bold hover:underline">hello@fitoagents.com</a>
            </div>

            <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant">
              <div className="w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-6">
                <span className="material-symbols-outlined text-2xl">chat</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-heading uppercase tracking-tight">Sales Inquiries</h2>
              <p className="text-on-surface-variant mb-4 text-sm leading-relaxed">
                Interested in a custom Enterprise plan or white-glove onboarding? We'd love to chat.
              </p>
              <a href="mailto:sales@fitoagents.com" className="text-tertiary font-bold hover:underline">sales@fitoagents.com</a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
