"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { copy } from "@/constants/copy";

type CheckinSession = {
  id: string;
  status: "pending" | "active" | "completed";
  scheduled_for: string;
};

type CheckinGetResponse = {
  session: CheckinSession | null;
  patientStageId: number | null;
  lastSessionSummary: string | null;
  gaugeCrossedToRed: boolean;
  surfaceHumanSupportResources: boolean;
  lcwsRescreenDue: boolean;
};

type ScreenState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "nothing_scheduled" }
  | { phase: "already_done" }
  | {
      phase: "ready";
      sessionId: string;
      patientStageId: number | null;
      lastSessionSummary: string | null;
      openingMessage: string;
      gaugeCrossedToRed: boolean;
      surfaceHumanSupportResources: boolean;
      lcwsRescreenDue: boolean;
    };

export default function CheckinPage() {
  const [screen, setScreen] = useState<ScreenState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const getRes = await fetch("/api/checkin");
        if (!getRes.ok) throw new Error("failed to load check-in");
        const {
          session,
          patientStageId,
          lastSessionSummary,
          gaugeCrossedToRed,
          surfaceHumanSupportResources,
          lcwsRescreenDue,
        }: CheckinGetResponse = await getRes.json();

        if (cancelled) return;

        if (!session) {
          setScreen({ phase: "nothing_scheduled" });
          return;
        }

        if (session.status === "completed") {
          setScreen({ phase: "already_done" });
          return;
        }

        const postRes = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            lastSessionSummary,
            gaugeCrossedToRed,
            surfaceHumanSupportResources,
            lcwsRescreenDue,
          }),
        });
        if (!postRes.ok) throw new Error("failed to start check-in");
        const { message }: { message: string } = await postRes.json();

        if (cancelled) return;

        setScreen({
          phase: "ready",
          sessionId: session.id,
          patientStageId,
          lastSessionSummary,
          openingMessage: message,
          gaugeCrossedToRed,
          surfaceHumanSupportResources,
          lcwsRescreenDue,
        });
      } catch (err) {
        console.error("[checkin] failed to initialize", err);
        if (!cancelled) setScreen({ phase: "error" });
      }
    }

    start();
    return () => {
      cancelled = true;
    };
  }, []);

  if (screen.phase !== "ready") {
    return (
      <main className="checkin-app">
        <CheckinHeader />
        <CheckinNav />
        <div className="checkin-app__body">
          <p className="checkin-app__state-message">
            {screen.phase === "loading" && copy.checkinLoadingState}
            {screen.phase === "nothing_scheduled" && copy.checkinNothingScheduled}
            {screen.phase === "already_done" && copy.checkinAlreadyDone}
            {screen.phase === "error" && copy.checkinErrorMessage}
          </p>
        </div>
      </main>
    );
  }

  return (
    <ActiveCheckin
      sessionId={screen.sessionId}
      patientStageId={screen.patientStageId}
      lastSessionSummary={screen.lastSessionSummary}
      openingMessage={screen.openingMessage}
      gaugeCrossedToRed={screen.gaugeCrossedToRed}
      surfaceHumanSupportResources={screen.surfaceHumanSupportResources}
      lcwsRescreenDue={screen.lcwsRescreenDue}
    />
  );
}

function CheckinHeader() {
  return (
    <header className="checkin-app__header">
      <div className="checkin-app__mark">
        <div className="checkin-app__mark-dot" />
      </div>
      <div className="checkin-app__identity">
        <span className="checkin-app__name">{copy.checkinCompanionName}</span>
        <span className="checkin-app__schedule-note">{copy.checkinScheduleNote}</span>
      </div>
      <div className="checkin-app__today-pill">
        <div className="checkin-app__today-dot" />
        <span className="checkin-app__today-label">{copy.checkinTodayPill}</span>
        <span className="checkin-app__today-chevron">&rsaquo;</span>
      </div>
    </header>
  );
}

// Still Water's own equivalent of SiteNav — kept in this file's own tokens
// rather than importing components/SiteNav, since this route does not use
// Lamplight styling (see AGENTS.md, checkin.css).
function CheckinNav() {
  return (
    <nav className="checkin-app__nav" aria-label={copy.navLabel}>
      <Link href="/" className="checkin-app__nav-link">
        {copy.navCompanionLabel}
      </Link>
      <span className="checkin-app__nav-link checkin-app__nav-link--active" aria-current="page">
        {copy.navCheckinLabel}
      </span>
      <Link href="/gauge-preview" className="checkin-app__nav-link">
        {copy.navGaugeLabel}
      </Link>
    </nav>
  );
}

function ActiveCheckin({
  sessionId,
  patientStageId,
  lastSessionSummary,
  openingMessage,
  gaugeCrossedToRed,
  surfaceHumanSupportResources,
  lcwsRescreenDue,
}: {
  sessionId: string;
  patientStageId: number | null;
  lastSessionSummary: string | null;
  openingMessage: string;
  gaugeCrossedToRed: boolean;
  surfaceHumanSupportResources: boolean;
  lcwsRescreenDue: boolean;
}) {
  const { messages, input, handleInputChange, handleSubmit, append, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [{ id: "opening", role: "assistant", content: openingMessage }],
    body: {
      sessionId,
      sessionKind: "daily_checkin",
      patientStageId,
      lastSessionSummary,
      gaugeCrossedToRed,
      surfaceHumanSupportResources,
      lcwsRescreenDue,
    },
  });
  const [ending, setEnding] = useState(false);
  const [ended, setEnded] = useState(false);

  async function handleEndCheckin() {
    setEnding(true);
    try {
      const res = await fetch("/api/checkin/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages }),
      });
      if (!res.ok) throw new Error("failed to end check-in");
      setEnded(true);
    } catch (err) {
      console.error("[checkin] failed to end session", err);
      setEnding(false);
    }
  }

  const showSuggestions = messages.length === 1 && !isLoading;

  if (ended) {
    return (
      <main className="checkin-app">
        <CheckinHeader />
        <CheckinNav />
        <div className="checkin-app__body">
          <p className="checkin-app__state-message">{copy.checkinEndedMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkin-app">
      <CheckinHeader />
      <CheckinNav />

      <div className="checkin-app__body">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "checkin-bubble checkin-bubble--caregiver" : "checkin-bubble checkin-bubble--companion"}
          >
            {message.content}
          </div>
        ))}

        {showSuggestions ? (
          <div className="checkin-suggestions">
            {copy.checkinQuickReplies.map((reply) => (
              <button
                key={reply.title}
                type="button"
                className="checkin-suggestion-card"
                onClick={() => append({ role: "user", content: reply.title })}
              >
                <span className="checkin-suggestion-card__title">{reply.title}</span>
                <span className="checkin-suggestion-card__detail">{reply.detail}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="checkin-app__privacy-pill">{copy.checkinPrivacyReassurance}</div>
      </div>

      {error ? <p className="checkin-app__error">{copy.checkinErrorMessage}</p> : null}

      <form onSubmit={handleSubmit} className="checkin-app__composer">
        <div className="checkin-app__composer-row">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={copy.checkinInputPlaceholder}
            disabled={isLoading}
            className="checkin-app__composer-input"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="checkin-app__composer-send">
            &uarr;
          </button>
        </div>
        {messages.length > 1 ? (
          <button
            type="button"
            onClick={handleEndCheckin}
            disabled={ending || isLoading}
            className="checkin-app__done-button"
          >
            {copy.checkinDoneButtonLabel}
          </button>
        ) : null}
      </form>
    </main>
  );
}
