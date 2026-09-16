"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";
import { alertsSupported, disableMissionAlerts, enableMissionAlerts, getAlertState } from "@/lib/push-client";

/** Alertes "nouvelle mission" sur le téléphone — visible uniquement côté freelance. */
export function MissionAlerts() {
  const toast = useToast();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getAlertState()
      .then((s) => setActive(s.devices > 0))
      .catch(() => undefined)
      .finally(() => setChecked(true));
  }, []);

  async function turnOn() {
    setBusy(true);
    try {
      await enableMissionAlerts();
      setActive(true);
      toast("Alertes activées. Vous serez prévenue dès qu'un salon publie un besoin.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Les alertes n'ont pas pu être activées.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    try {
      await disableMissionAlerts();
      setActive(false);
      toast("Alertes désactivées.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "L'action n'a pas abouti.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!checked) return null;

  return (
    <div className="editorial-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Alertes missions</p>
          <p className="mt-0.5 text-xs text-noir-chaud/60">Une notification dès qu&apos;un salon publie un besoin.</p>
        </div>
        {active ? (
          <button
            onClick={turnOff}
            disabled={busy}
            className="shrink-0 rounded-full border border-noir-chaud/20 px-4 py-2 text-xs text-noir-chaud/70 disabled:opacity-50"
          >
            Désactiver
          </button>
        ) : (
          <button
            onClick={turnOn}
            disabled={busy || !alertsSupported()}
            className="shrink-0 rounded-full bg-noir-chaud px-4 py-2 text-xs text-ivoire transition hover:bg-laiton disabled:opacity-50"
          >
            {alertsSupported() ? "Activer" : "Non disponible"}
          </button>
        )}
      </div>
    </div>
  );
}
