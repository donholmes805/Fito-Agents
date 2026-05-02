import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant px-gutter py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="text-2xl font-black text-white font-heading uppercase tracking-tighter">
            Fito Agents
          </Link>
          <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
            Fito Agents by Fito Technology, LLC helps businesses launch AI-powered digital workers that answer questions, capture leads, and automate daily tasks.
          </p>
          <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">mail</span>
              </a>
          </div>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            <li><Link href="/how-it-works" className="hover:text-secondary transition-colors">Process</Link></li>
            <li><Link href="/agent-types" className="hover:text-secondary transition-colors">Blueprints</Link></li>
            <li><Link href="/pricing" className="hover:text-secondary transition-colors">Pricing</Link></li>
            <li><Link href="/contact" className="hover:text-secondary transition-colors">Request Demo</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            <li><Link href="#" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-secondary transition-colors">Security</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em]">
          © 2024 Fito Technology, LLC. Intelligence Redefined.
        </p>
        <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> System Status: Operational
            </span>
        </div>
      </div>
    </footer>
  );
}
