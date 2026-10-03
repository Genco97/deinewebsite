export function Rechtstext({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{titel}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink">
        {children}
      </div>
    </article>
  );
}
