import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-xl border border-line bg-surface p-5 sm:p-8">{children}</div>
    </main>
  );
}
