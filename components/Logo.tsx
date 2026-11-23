export function PinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true">
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20C24 5.373 18.627 0 12 0z"
        fill="#0B2545"
      />
      <path
        d="M2.6 13.4c3-1.7 5.4 1.3 9.4 1.3s6.4-3 9.4-1.3C20.9 19.8 15.6 25.9 12 29.4 8.4 25.9 3.1 19.8 2.6 13.4z"
        fill="#4FC3E8"
      />
      <circle cx="12" cy="11" r="4" fill="#fff" />
    </svg>
  );
}

export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const bumaha = variant === "dark" ? "text-white" : "text-navy";
  const kaya = variant === "dark" ? "text-aqua" : "text-signal";
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <PinMark className="h-7 w-auto" />
      <span className="font-display text-xl font-extrabold leading-none tracking-tight">
        <span className={bumaha}>Bumaha</span>
        <span className={kaya}>Kaya</span>
        <span className="text-amber">?</span>
      </span>
    </span>
  );
}
