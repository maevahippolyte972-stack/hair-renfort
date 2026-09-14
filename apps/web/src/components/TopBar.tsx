import type { Role } from "@/lib/session";

export function TopBar({ role }: { role: Role }) {
  return (
    <header className="flex items-center justify-between border-b border-noir-chaud/10 bg-ivoire px-6 py-4">
      <span className="font-serif text-2xl">Hair&apos;Renfort</span>
      <span className="rounded-full border border-noir-chaud/20 px-4 py-1.5 text-sm text-noir-chaud/70">
        {role === "SALON" ? "Vue salon" : "Vue freelance"}
      </span>
    </header>
  );
}
