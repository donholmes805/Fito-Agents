import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-gutter">
        <h1 className="font-heading text-4xl font-bold mb-8">How Fito Agents Works</h1>
        <div className="space-y-12">
            <Step number="1" title="Create Your Agent" description="Select an agent blueprint and customize the name, tone, and brand colors." />
            <Step number="2" title="Add Your Knowledge" description="Upload FAQs, documents, and business details to train your agent." />
            <Step number="3" title="Embed on Website" description="Copy and paste a single line of code to launch your agent live." />
            <Step number="4" title="Monitor & Scale" description="Track conversations and leads in your dashboard as your agent handles the work." />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-6">
            <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary-fixed flex items-center justify-center font-heading text-xl font-bold flex-shrink-0">
                {number}
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-on-surface-variant">{description}</p>
            </div>
        </div>
    );
}
