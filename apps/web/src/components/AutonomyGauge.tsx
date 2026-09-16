"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AutonomyGaugeProps {
  topSalonPourcentage: number;
  nombreSalonsDifferents: number;
  totalMissions: number;
}

interface Answers {
  organisationLibre: boolean;
  aucuneExclusivite: boolean;
}

const DEFAULT_ANSWERS: Answers = { organisationLibre: true, aucuneExclusivite: true };
const STORAGE_KEY = "hr_autonomy_answers";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Repère préventif d'autonomie professionnelle, visible uniquement par la freelance
 * elle-même (jamais par un salon). Combine deux signaux réels tirés de l'historique
 * de missions (concentration + diversité des salons) et deux questions auto-déclarées,
 * modifiables à tout moment. Ce n'est ni un diagnostic juridique ni une décision URSSAF.
 */
export function AutonomyGauge({ topSalonPourcentage, nombreSalonsDifferents, totalMissions }: AutonomyGaugeProps) {
  const [answers, setAnswers] = useState<Answers>(DEFAULT_ANSWERS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers({ ...DEFAULT_ANSWERS, ...JSON.parse(raw) });
    } catch {
      // localStorage indisponible : on garde les valeurs par défaut, sans bloquer l'affichage.
    }
  }, []);

  function setAnswer(key: keyof Answers, value: boolean) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Repère personnel non critique : un échec d'écriture locale n'empêche pas de continuer.
    }
  }

  if (totalMissions === 0) {
    return (
      <div className="editorial-card p-5">
        <p className="kicker">Autonomie professionnelle</p>
        <p className="mt-2 text-sm text-noir-chaud/60">
          Pas encore assez d&apos;historique de missions pour calculer ce repère.
        </p>
      </div>
    );
  }

  const concentrationPoints = clamp(Math.round((topSalonPourcentage - 20) * 0.65), 0, 40);
  const diversityPoints =
    nombreSalonsDifferents >= 4 ? 0 : nombreSalonsDifferents === 3 ? 5 : nombreSalonsDifferents === 2 ? 10 : 20;
  const organisationPoints = answers.organisationLibre ? 0 : 20;
  const exclusivitePoints = answers.aucuneExclusivite ? 0 : 20;
  const score = clamp(concentrationPoints + diversityPoints + organisationPoints + exclusivitePoints, 0, 100);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  const level =
    score < 30
      ? { label: "Repères équilibrés", copy: "Votre activité présente actuellement plusieurs signes d'autonomie." }
      : score < 60
        ? { label: "À observer", copy: "Quelques habitudes méritent votre attention pour préserver votre autonomie." }
        : { label: "À diversifier", copy: "Plusieurs repères se concentrent. Vous pouvez faire le point à votre rythme." };

  return (
    <div className="overflow-hidden editorial-card p-5">
      <p className="kicker">Autonomie professionnelle</p>

      <div className="mt-4 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <div className="relative mx-auto size-36 shrink-0" role="img" aria-label={`Niveau d'attention indicatif : ${score} sur 100, ${level.label}`}>
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-noir-chaud/10" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={score < 30 ? "stroke-vert-confirmation" : score < 60 ? "stroke-laiton" : "stroke-bordeaux"}
              style={{ strokeDasharray: circumference }}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <strong className="font-serif text-3xl">{score}</strong>
            <span className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-noir-chaud/50">sur 100</span>
          </div>
        </div>

        <div>
          <p className="font-serif text-xl">{level.label}</p>
          <p className="mt-1 text-sm text-noir-chaud/60">{level.copy}</p>
          <p className="mt-3 rounded-lg bg-noir-chaud/5 p-2.5 text-xs leading-5 text-noir-chaud/60">
            Repère préventif, pas un diagnostic juridique ni une décision de l&apos;URSSAF.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-noir-chaud/5 p-3">
          <p className="text-xs text-noir-chaud/50">Concentration</p>
          <p className="mt-1 font-serif text-xl">{topSalonPourcentage}%</p>
          <p className="mt-0.5 text-[0.68rem] text-noir-chaud/50">des missions avec le même salon</p>
        </div>
        <div className="rounded-xl bg-noir-chaud/5 p-3">
          <p className="text-xs text-noir-chaud/50">Diversité</p>
          <p className="mt-1 font-serif text-xl">{nombreSalonsDifferents}</p>
          <p className="mt-0.5 text-[0.68rem] text-noir-chaud/50">salon(s) différent(s)</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <ToggleRow
          label="J'organise librement mes horaires et ma façon de travailler"
          value={answers.organisationLibre}
          onChange={(v) => setAnswer("organisationLibre", v)}
        />
        <ToggleRow
          label="Aucune exclusivité ne m'est demandée"
          value={answers.aucuneExclusivite}
          onChange={(v) => setAnswer("aucuneExclusivite", v)}
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 p-3">
      <p className="text-xs leading-5 text-noir-chaud/80">{label}</p>
      <div className="flex shrink-0 overflow-hidden rounded-full border border-noir-chaud/15">
        <button
          onClick={() => onChange(true)}
          className={`px-3 py-1.5 text-xs transition ${value ? "bg-noir-chaud text-ivoire" : "text-noir-chaud/60"}`}
        >
          Oui
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-3 py-1.5 text-xs transition ${!value ? "bg-bordeaux text-ivoire" : "text-noir-chaud/60"}`}
        >
          Non
        </button>
      </div>
    </div>
  );
}
