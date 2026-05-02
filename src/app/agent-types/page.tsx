import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

const agentTypes = [
  { name: "Website AI Agent", description: "Navigates your site with users, answers product questions, and captures visitor info." },
  { name: "Customer Support Agent", description: "Expert technical support that solves user problems by referencing your knowledge base." },
  { name: "Sales & Lead Agent", description: "Proactive assistant trained to qualify leads and push deals through the funnel." },
  { name: "Booking Request Agent", description: "Automated scheduling for meetings, demos, or appointments." },
  { name: "Document Assistant Agent", description: "Synthesize information from PDFs, CSVs, or text files." },
  { name: "App Assistant Agent", description: "A headless agent that lives inside your own application via API." },
];

export default function AgentTypesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-gutter text-center">
        <h1 className="font-heading text-4xl font-bold mb-12">Fito Agent Blueprints</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agentTypes.map(agent => (
                <div key={agent.name} className="glass-panel p-8 rounded-3xl rim-light text-left">
                    <h3 className="font-heading text-xl font-bold mb-4">{agent.name}</h3>
                    <p className="text-on-surface-variant mb-6">{agent.description}</p>
                    <button className="btn-secondary w-full">Learn More</button>
                </div>
            ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
