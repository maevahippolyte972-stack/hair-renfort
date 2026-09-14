"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/FormField";
import { apiFetch, ApiError } from "@/lib/api";

export default function ConnexionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    setLoading(true);
    try {
      const result = await apiFetch<{ accessToken: string; role: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      localStorage.setItem("hr_token", result.accessToken);
      localStorage.setItem("hr_role", result.role);
      router.push("/app/decouvrir");
    } catch (err) {
      setError(err instanceof ApiError ? "Identifiants invalides." : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivoire px-6 text-noir-chaud">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl">Connexion</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <FormField id="email" name="email" type="email" label="Email" required />
          <FormField id="password" name="password" type="password" label="Mot de passe" required />
          {error && <p className="text-sm text-bordeaux">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-noir-chaud px-6 py-3 text-ivoire transition hover:bg-laiton disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
