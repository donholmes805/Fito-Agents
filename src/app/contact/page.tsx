import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-gutter">
        <div className="glass-panel rounded-3xl p-12 rim-light">
            <h1 className="font-heading text-3xl font-bold mb-4">Request a Demo</h1>
            <p className="text-on-surface-variant mb-8">Tell us about your business and we'll show you how Fito Agents can automate your workflows.</p>
            
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                        <input type="text" className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Work Email</label>
                        <input type="email" className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">What are you looking to automate?</label>
                    <textarea className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface h-32" />
                </div>
                <button type="button" className="btn-primary w-full py-4">Send Request</button>
            </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
