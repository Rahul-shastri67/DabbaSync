import { NavLink } from "react-router-dom";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ children, tone = "muted" }) {
  const tones = {
    muted: "border-white/10 bg-white/5 text-white/70",
    brand: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    good: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    warn: "border-orange-400/20 bg-orange-400/10 text-orange-200"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary:
      "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-[0_12px_30px_-16px_rgba(245,158,11,.9)] hover:from-amber-200 hover:to-amber-500",
    secondary: "bg-white/8 text-white hover:bg-white/12",
    ghost: "bg-transparent text-white/80 hover:bg-white/6",
    danger: "bg-gradient-to-b from-rose-400 to-rose-600 text-white hover:from-rose-300 hover:to-rose-600"
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold",
        "ring-1 ring-white/10 backdrop-blur transition-all duration-200",
        "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
        "disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl bg-black/30 px-4 py-2.5 text-sm text-white/90",
        "ring-1 ring-white/10 outline-none transition-all duration-200",
        "placeholder:text-white/35 focus:ring-2 focus:ring-amber-400/60",
        className
      )}
    />
  );
}

export function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/6 to-white/[0.02] p-5",
        "ring-1 ring-white/10 shadow-[0_20px_60px_-40px_rgba(0,0,0,.8)]",
        "transition-all duration-300 hover:ring-white/15",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? <h3 className="truncate text-sm font-semibold text-white/90">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-xs text-white/55">{subtitle}</p> : null}
        </div>
        {right ? <div className="relative shrink-0">{right}</div> : null}
      </div>

      <div className="relative mt-4 text-sm text-white/75">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "brand" }) {
  const glow =
    tone === "good"
      ? "from-emerald-400/18"
      : tone === "warn"
        ? "from-orange-400/18"
        : "from-amber-400/18";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/6 to-white/[0.02] p-5 ring-1 ring-white/10">
      <div className={cn("absolute -top-10 right-0 h-40 w-40 rounded-full blur-3xl", glow)} />
      <div className="relative text-xs text-white/55">{label}</div>
      <div className="relative mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
      {hint ? <div className="relative mt-1 text-xs text-white/45">{hint}</div> : null}
    </div>
  );
}

export function Tabs({ items }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            cn(
              "rounded-xl px-3 py-2 text-sm font-semibold transition-all",
              isActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
            )
          }
        >
          {it.label}
        </NavLink>
      ))}
    </div>
  );
}

