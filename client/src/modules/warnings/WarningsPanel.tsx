import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';

export const WarningsPanel = () => {
  const warnings = useRecipeWorkspaceStore((state) => state.warnings);
  const hasWarnings = warnings.length > 0;

  return (
    <aside className="surface-card w-full rounded-2xl px-5 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Quality Checks</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hasWarnings ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-secondary/20 text-brand-secondary'
          }`}
        >
          {warnings.length} {warnings.length === 1 ? 'Notice' : 'Notices'}
        </span>
      </div>
      <div className="mt-4 space-y-3 text-sm text-neutral-700">
        {hasWarnings ? (
          warnings.map((warning) => (
            <div
              key={warning}
              className="rounded-xl border border-white/60 bg-white/80 p-4 shadow-soft shadow-brand-accent/[0.08]"
            >
              {warning}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-white/70 p-4 text-neutral-500">
            No warnings yet. Run validators after confirming your extraction.
          </div>
        )}
      </div>
    </aside>
  );
};
