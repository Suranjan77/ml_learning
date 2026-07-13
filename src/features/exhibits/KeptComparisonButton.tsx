interface KeptComparisonButtonProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
}

export function KeptComparisonButton({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
}: KeptComparisonButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`mt-1 min-h-8 w-full border px-2 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${active ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:border-primary hover:text-primary"}`}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
