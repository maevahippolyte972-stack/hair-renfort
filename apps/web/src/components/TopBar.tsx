import type { Role } from "@/lib/session";

export function TopBar({ role }: { role: Role }) {
  return (
    <header className="glass-bar sticky top-0 z-40 flex items-center justify-between px-6 py-4">
      <span className="font-serif text-2xl">
        Hair<span className="text-laiton">&apos;</span>Renfort
      </span>
      <span className="chip text-noir-chaud/70">{role === "SALON" ? "Vue salon" : "Vue freelance"}</span>
    </header>
  );
}
