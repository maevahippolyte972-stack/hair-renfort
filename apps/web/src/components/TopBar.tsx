import type { Role } from "@/lib/session";

export function TopBar({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-noir-chaud/10 bg-ivoire/85 px-6 py-4 backdrop-blur-md">
      <span className="font-serif text-2xl">Hair&apos;Renfort</span>
      <span className="rounded-full border border-noir-chaud/20 bg-white/40 px-4 py-1.5 text-sm text-noir-chaud/70">
        {role === "SALON" ? "Vue salon" : "Vue freelance"}
      </span>
    </header>
  );
}
