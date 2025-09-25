import { useMemo } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';
import type { ValidationWarning } from '@xr/shared';

const getSeverityStyle = (warning: ValidationWarning) => {
  switch (warning.severity) {
    case 'error':
      return 'border-red-200 bg-red-50 text-red-700 shadow-red-100';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-100';
  }
};

export const WarningsPanel = () => {
  const warnings = useRecipeWorkspaceStore((state) => state.warnings);
  const hasWarnings = warnings.length > 0;

  const summaryLabel = useMemo(() => {
    if (!hasWarnings) {
      return 'All clear';
    }

    const errorCount = warnings.filter((warning) => warning.severity === 'error').length;
    const warningCount = warnings.filter((warning) => warning.severity === 'warning').length;

    if (errorCount > 0) {
      return `${errorCount} issue${errorCount > 1 ? 's' : ''}`;
    }

    if (warningCount > 0) {
      return `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    }

    return `${warnings.length} notice${warnings.length > 1 ? 's' : ''}`;
  }, [hasWarnings, warnings]);

  return (
    <aside className="surface-card w-full rounded-2xl px-5 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Quality Checks</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hasWarnings ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-secondary/20 text-brand-secondary'
          }`}
        >
          {summaryLabel}
        </span>
      </div>
      <div className="mt-4 space-y-3 text-sm text-neutral-700">
        {hasWarnings ? (
          warnings.map((warning) => (
            <div
              key={`${warning.code}-${warning.pointer}`}
              className={`rounded-xl border p-4 shadow-soft ${getSeverityStyle(warning)}`}
            >
              <p className="font-medium">{warning.message}</p>
              <p className="mt-1 text-xs text-neutral-500">Field: {warning.pointer}</p>
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
