/**
 * PortalSelector — Santri vs Alumni portal toggle.
 * Uses explicit variant prop (variant="santri" | variant="alumni"), not booleans.
 *
 * @param {{ variant: 'santri' | 'alumni', onChange: (variant: 'santri' | 'alumni') => void }} props
 */
export function PortalSelector({ variant, onChange }) {
  const options = [
    { value: 'santri', label: 'Calon Santri Baru' },
    { value: 'alumni', label: 'Portal Alumni HAMAS' },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-2 p-1 bg-background rounded-lg border border-primary/5"
      role="tablist"
      aria-label="Pilih jenis portal"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={variant === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-11 min-w-11 py-2 px-3 text-xs font-semibold rounded-md transition-standard cursor-pointer ${
            variant === option.value
              ? 'bg-primary text-secondary shadow-sm'
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
