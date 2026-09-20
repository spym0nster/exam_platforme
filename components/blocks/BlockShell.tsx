export function BlockShell({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
          Bloc — {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-ink-3 hover:text-bad"
          aria-label="Supprimer ce bloc"
        >
          Supprimer
        </button>
      </div>
      {children}
    </div>
  );
}
