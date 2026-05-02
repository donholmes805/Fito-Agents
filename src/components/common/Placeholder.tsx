export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-outline-variant">
      <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant italic">This page is planned for Phase 2 implementation.</p>
    </div>
  );
}
