"use client";

import { useEffect, useState } from "react";
import { Gauge } from "@/components/Gauge";
import { copy } from "@/constants/copy";
import { classifyGaugeColor, type GaugeColor, type ScoreHistoryEntry } from "@/lib/companion/burnout";

type GaugeState = {
  burnout_score_current: number | null;
  score_history: ScoreHistoryEntry[] | null;
  missed_checkin_streak: number | null;
  color: GaugeColor | null;
} | null;

/**
 * Phase 5 dev scaffold — a minimal, internal way to see the gauge render
 * during this phase. Not the Phase 6 caregiver-facing dashboard (out of
 * scope here); reachable via SiteNav ("Gauge") alongside the other routes.
 */
export default function GaugePreviewPage() {
  const [state, setState] = useState<GaugeState>(undefined as unknown as GaugeState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gauge")
      .then((res) => {
        if (!res.ok) throw new Error("gauge fetch failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setState(data.state ?? null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const history = [...(state?.score_history ?? [])].reverse();

  return (
    <main className="flex flex-1 flex-col gap-card-gap bg-paper-app px-screen-gutter py-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-headline font-semibold text-ink-900">{copy.gaugePreviewTitle}</h1>
        <p className="text-supporting text-ink-500">{copy.gaugePreviewSubtitle}</p>
      </header>

      {loading ? (
        <p className="text-body text-ink-500">{copy.gaugePreviewLoading}</p>
      ) : error ? (
        <p className="text-supporting text-clay-700">{copy.gaugePreviewErrorMessage}</p>
      ) : !state || state.burnout_score_current == null ? (
        <p className="text-body text-ink-500">{copy.gaugeNoDataMessage}</p>
      ) : (
        <>
          <Gauge color={state.color ?? classifyGaugeColor(state.burnout_score_current)} />

          <p className="text-caption text-ink-400">
            {copy.gaugePreviewMissedStreakLabel}: {state.missed_checkin_streak ?? 0}
          </p>

          <section className="flex flex-col gap-card-gap">
            <h2 className="text-body font-semibold text-ink-900">{copy.gaugePreviewHistoryHeading}</h2>
            <div className="flex flex-col gap-8">
              {history.map((entry, i) => (
                <div
                  key={`${entry.at}-${i}`}
                  className="flex items-center justify-between rounded-chip border border-paper-hairline bg-paper-card px-12 py-9 text-caption text-ink-500"
                >
                  <span>{new Date(entry.at).toLocaleString()}</span>
                  <span>{entry.type}</span>
                  <span className="font-medium text-ink-900">{entry.color}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
