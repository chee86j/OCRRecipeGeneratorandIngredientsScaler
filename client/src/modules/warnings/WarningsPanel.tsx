import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';

export const WarningsPanel = () => {
  const warnings = useRecipeWorkspaceStore((state) => state.warnings);

  return (
    <aside className="w-72 border-l border-slate-800 bg-slate-950/60 px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Warnings</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{warnings.length}</span>
      </div>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        {warnings.length === 0 ? (
          <p>No warnings yet. Run validators after confirming extraction.</p>
        ) : (
          warnings.map((warning) => (
            <div key={warning} className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
              {warning}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
