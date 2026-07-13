interface KeptComparisonButtonProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
  inline?: boolean;
}

export function KeptComparisonButton({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
  inline = false,
}: KeptComparisonButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${inline ? "min-h-8 shrink-0" : "mt-1 min-h-8 w-full"} border px-2 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${active ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:border-primary hover:text-primary"}`}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
