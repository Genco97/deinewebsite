import type { ComponentProps, ReactNode } from "react";

type Variante = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variante: Variante = "primary", extra = "") {
  const basis =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const v: Record<Variante, string> = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    secondary: "border border-line bg-surface text-ink hover:border-brand hover:text-brand",
    ghost: "text-brand hover:bg-brand-light",
    danger: "border border-danger/30 bg-surface text-danger hover:bg-danger-light",
  };
  return `${basis} ${v[variante]} ${extra}`;
}

export const inputClass =
  "block min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function Feld({
  label,
  name,
  hinweis,
  fehler,
  pflicht,
  children,
}: {
  label: string;
  name: string;
  hinweis?: string;
  fehler?: string;
  pflicht?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {pflicht ? <span className="text-muted"> *</span> : null}
      </label>
      {children}
      {hinweis && !fehler ? <p className="text-sm text-muted">{hinweis}</p> : null}
      {fehler ? (
        <p id={`${name}-fehler`} className="text-sm font-medium text-danger">
          {fehler}
        </p>
      ) : null}
    </div>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input id={props.name} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea id={props.name} {...props} className={`${inputClass} min-h-28 ${props.className ?? ""}`} />
  );
}

export function Select(props: ComponentProps<"select">) {
  return <select id={props.name} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Hinweis({
  art = "info",
  children,
}: {
  art?: "info" | "fehler" | "ok" | "warnung";
  children: ReactNode;
}) {
  const s = {
    info: "border-brand/20 bg-brand-light text-ink",
    fehler: "border-danger/30 bg-danger-light text-danger",
    ok: "border-ok/30 bg-ok-light text-ok",
    warnung: "border-amber-300 bg-amber-50 text-amber-900",
  }[art];
  return (
    <div role={art === "fehler" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${s}`}>
      {children}
    </div>
  );
}

export function Karte({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface ${className}`}>{children}</div>;
}
