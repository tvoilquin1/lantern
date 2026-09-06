(function(){
  var e = React.createElement;
  function px(v){ return v; }

  /* ---------- surfaces ---------- */
  var CARD_VARIANTS = {
    paper: { background: "var(--surface-card)", boxShadow: "var(--shadow-card)", color: "var(--text-primary)" },
    muted: { background: "var(--surface-muted)", color: "var(--text-primary)" },
    dark:  { background: "var(--surface-dark)", color: "var(--text-on-dark)" },
    panel: { background: "var(--surface-card)", boxShadow: "var(--shadow-hairline)", color: "var(--text-primary)" }
  };
  function Card(p){
    var variant = p.variant || "paper";
    var padded = p.padded !== false;
    var rest = Object.assign({}, p);
    delete rest.variant; delete rest.padded; delete rest.gap; delete rest.radius; delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      display: "flex", flexDirection: "column",
      gap: p.gap || "var(--card-gap)",
      borderRadius: p.radius || ((variant === "panel" || variant === "muted") ? "var(--radius-panel)" : "var(--radius-card)"),
      padding: padded ? "var(--card-padding-y) var(--card-padding-x)" : 0,
      boxSizing: "border-box"
    }, CARD_VARIANTS[variant], p.style) }), p.children);
  }

  function InsetPanel(p){
    var rest = Object.assign({}, p);
    delete rest.label; delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      background: "var(--surface-inset)", borderRadius: "var(--radius-inset)",
      padding: "12px 14px", display: "flex", flexDirection: "column", gap: "var(--space-8)"
    }, p.style) }),
      p.label ? e("div", { style: { fontSize: "10px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--text-eyebrow-tracking)", textTransform: "uppercase", color: "var(--text-faint)" } }, p.label) : null,
      p.children);
  }

  function SectionLabel(p){
    var rest = Object.assign({}, p);
    delete rest.onDark; delete rest.size; delete rest.wide; delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      fontSize: p.size === "sm" ? "var(--text-eyebrow-size-sm)" : "var(--text-eyebrow-size)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: p.wide ? "var(--text-eyebrow-tracking-wide)" : "var(--text-eyebrow-tracking)",
      textTransform: "uppercase",
      color: p.onDark ? "var(--text-label-on-dark)" : "var(--text-body)"
    }, p.style) }), p.children);
  }

  /* ---------- status ---------- */
  var PILL_TONES = {
    steady:  { color: "var(--state-steady-fg)", background: "var(--state-steady-bg)" },
    caution: { color: "var(--state-caution-fg)", background: "var(--state-caution-bg)" },
    risk:    { color: "var(--state-risk-fg)", background: "var(--state-risk-bg)" },
    neutral: { color: "var(--text-body)", background: "var(--surface-muted)" }
  };
  function StatePill(p){
    var rest = Object.assign({}, p);
    delete rest.tone; delete rest.style; delete rest.children;
    return e("span", Object.assign({}, rest, { style: Object.assign({
      display: "inline-flex", alignItems: "center",
      fontSize: "var(--text-chip-size)", fontWeight: "var(--weight-semibold)",
      padding: "5px 10px", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap"
    }, PILL_TONES[p.tone || "steady"], p.style) }), p.children);
  }

  var TRACK_FILLS = { steady: "var(--sage-600)", caution: "var(--ochre-400)", risk: "var(--clay-400)" };
  function StateTrack(p){
    var value = p.value || 0, tone = p.tone || "steady";
    var rest = Object.assign({}, p);
    delete rest.value; delete rest.tone; delete rest.segments; delete rest.labels; delete rest.style;
    if (p.segments) {
      var filled = Math.round((value / 100) * p.segments);
      var segs = [];
      for (var i = 0; i < p.segments; i++) {
        segs.push(e("div", { key: i, style: { flex: 1, height: "7px", borderRadius: "var(--radius-pill)", background: i < filled ? TRACK_FILLS[tone] : "var(--paper-muted)" } }));
      }
      return e("div", Object.assign({}, rest, { style: Object.assign({ display: "flex", flexDirection: "column", gap: "var(--space-6)" }, p.style) }),
        e("div", { style: { display: "flex", gap: "4px" } }, segs),
        p.labels ? e("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "var(--text-caption-size)", color: "var(--text-body)" } },
          p.labels.map(function(l){ return e("div", { key: l }, l); })) : null);
    }
    return e("div", Object.assign({}, rest, { style: Object.assign({ height: "8px", borderRadius: "var(--radius-pill)", background: "var(--paper-muted)", overflow: "hidden", display: "flex" }, p.style) }),
      e("div", { style: { width: value + "%", borderRadius: "var(--radius-pill)", background: tone === "steady" ? "var(--sage-600)" : "linear-gradient(90deg, var(--sage-200), var(--ochre-400))" } }));
  }

  var TREND_TONES = { steady: "var(--sage-600)", caution: "var(--ochre-700)", risk: "var(--clay-700)" };
  function TrendRow(p){
    var items = p.items || [], divider = p.divider !== false;
    var rest = Object.assign({}, p);
    delete rest.items; delete rest.divider; delete rest.style;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      display: "flex", gap: "var(--space-10)",
      borderTop: divider ? "1px solid var(--border-rule)" : "none",
      paddingTop: divider ? "13px" : 0
    }, p.style) }), items.map(function(it){
      return e("div", { key: it.label, style: { flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" } },
        e("div", { style: { fontSize: "var(--text-caption-size)", color: "var(--text-body)" } }, it.label),
        e("div", { style: { fontSize: "var(--text-body-size)", fontWeight: "var(--weight-semibold)", color: TREND_TONES[it.tone || "steady"] } }, it.value));
    }));
  }

  var RAMP = ["var(--sage-100)", "var(--sage-150)", "var(--sage-200)", "var(--sage-600)"];
  function Sparkline(p){
    var values = p.values || [], height = p.height || 46;
    var max = Math.max.apply(null, values.concat([1]));
    var rest = Object.assign({}, p);
    delete rest.values; delete rest.height; delete rest.style;
    return e("div", Object.assign({}, rest, { style: Object.assign({ display: "flex", gap: "var(--space-5)", alignItems: "flex-end", height: height + "px" }, p.style) }),
      values.map(function(v, i){
        var idx = Math.min(RAMP.length - 1, Math.floor((i / Math.max(values.length - 1, 1)) * RAMP.length));
        return e("div", { key: i, style: { flex: 1, height: Math.round((v / max) * 100) + "%", borderRadius: "var(--space-6)", background: RAMP[idx] } });
      }));
  }

  function StageHeadline(p){
    var rest = Object.assign({}, p);
    delete rest.stage; delete rest.qualifier; delete rest.style;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      fontWeight: "var(--weight-bold)", letterSpacing: "var(--text-display-tracking)",
      fontSize: "var(--text-display-size)", color: "var(--text-primary)"
    }, p.style) }), p.stage,
      p.qualifier ? e("span", { style: { fontSize: "17px", color: "var(--text-faint)" } }, " — " + p.qualifier) : null);
  }

  /* ---------- conversation ---------- */
  function MessageBubble(p){
    var companion = (p.from || "companion") === "companion";
    var rest = Object.assign({}, p);
    delete rest.from; delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      maxWidth: "86%",
      alignSelf: companion ? "flex-start" : "flex-end",
      background: companion ? "var(--surface-card)" : "var(--sage-100)",
      boxShadow: companion ? "var(--shadow-hairline)" : "none",
      color: companion ? "var(--text-primary)" : "var(--sage-900)",
      borderRadius: companion
        ? "var(--radius-bubble) var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail)"
        : "var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail) var(--radius-bubble)",
      padding: "16px 18px",
      fontSize: "var(--text-message-size)",
      lineHeight: "var(--text-body-leading)",
      display: "flex", flexDirection: "column", gap: "var(--space-12)"
    }, p.style) }), p.children);
  }

  var CHIP_TONES = {
    steady:  { color: "var(--state-steady-fg)", background: "var(--state-steady-bg)" },
    caution: { color: "var(--state-caution-fg)", background: "var(--state-caution-bg)" },
    risk:    { color: "var(--state-risk-fg)", background: "var(--state-risk-bg)" }
  };
  function LogChip(p){
    var rest = Object.assign({}, p);
    delete rest.tone; delete rest.style; delete rest.children;
    return e("span", Object.assign({}, rest, { style: Object.assign({
      fontSize: "var(--text-chip-size)", fontWeight: "var(--weight-medium)",
      padding: "5px 10px", borderRadius: "var(--radius-chip)"
    }, CHIP_TONES[p.tone || "steady"], p.style) }), p.children);
  }

  function SuggestionChip(p){
    var rest = Object.assign({}, p);
    delete rest.style; delete rest.children;
    return e("button", Object.assign({}, rest, { style: Object.assign({
      font: "inherit", fontSize: "var(--text-body-lg-size)", color: "var(--sage-700)",
      background: "var(--surface-card)", border: "1px solid var(--border-quiet)",
      padding: "10px 14px", borderRadius: "var(--radius-pill)", cursor: "pointer", minHeight: "44px"
    }, p.style) }), p.children);
  }

  function ChipRow(p){
    var rest = Object.assign({}, p);
    delete rest.gap; delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({ display: "flex", flexWrap: "wrap", gap: p.gap || "var(--space-8)" }, p.style) }), p.children);
  }

  function Composer(p){
    var rest = Object.assign({}, p);
    delete rest.placeholder; delete rest.onSend; delete rest.style;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      background: "var(--surface-card)", borderRadius: "var(--radius-pill)",
      padding: "14px 16px 14px 22px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: "var(--space-12)", boxShadow: "var(--shadow-raised)"
    }, p.style) }),
      e("div", { style: { fontSize: "15px", color: "var(--text-faint)" } }, p.placeholder || "Talk to Lantern…"),
      e("button", { onClick: p.onSend, "aria-label": "Send", style: {
        width: "40px", height: "40px", flexShrink: 0, border: "none", cursor: "pointer",
        borderRadius: "var(--radius-pill)", background: "var(--accent)",
        color: "var(--accent-contrast)", fontSize: "17px", lineHeight: 1
      } }, "↑"));
  }

  /* ---------- actions ---------- */
  var BTN_VARIANTS = {
    primary:   { background: "var(--accent)", color: "#FBFAF6", border: "none", fontWeight: "var(--weight-semibold)" },
    secondary: { background: "var(--surface-card)", color: "var(--sage-700)", border: "1px solid var(--border-quiet)", fontWeight: "var(--weight-semibold)" },
    quiet:     { background: "transparent", color: "var(--text-faint)", border: "none", fontWeight: "var(--weight-regular)" }
  };
  function Button(p){
    var variant = p.variant || "primary";
    var full = p.full !== false;
    var rest = Object.assign({}, p);
    delete rest.variant; delete rest.full; delete rest.style; delete rest.children;
    return e("button", Object.assign({}, rest, { style: Object.assign({
      font: "inherit", fontSize: "15.5px",
      padding: variant === "quiet" ? "var(--space-6)" : "17px",
      width: full ? "100%" : "auto",
      borderRadius: "var(--radius-pill)", textAlign: "center", cursor: "pointer", minHeight: "44px"
    }, BTN_VARIANTS[variant], p.style) }), p.children);
  }

  function TaskItem(p){
    var rest = Object.assign({}, p);
    delete rest.done; delete rest.onDark; delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({ display: "flex", gap: "var(--space-12)", alignItems: "flex-start" }, p.style) }),
      e("div", { style: {
        width: "18px", height: "18px", borderRadius: "var(--space-6)", flexShrink: 0, marginTop: "2px",
        border: "1.5px solid " + (p.onDark ? "var(--sage-400)" : "var(--sage-600)"),
        background: p.done ? (p.onDark ? "var(--sage-400)" : "var(--sage-600)") : "transparent"
      } }),
      e("div", { style: { fontSize: "var(--text-body-lg-size)", lineHeight: "1.5", color: p.onDark ? "var(--text-on-dark)" : "var(--text-secondary)" } }, p.children));
  }

  function GuidanceList(p){
    var items = p.items || [];
    var rest = Object.assign({}, p);
    delete rest.items; delete rest.style;
    return e("div", Object.assign({}, rest, { style: Object.assign({ display: "flex", flexDirection: "column", gap: "var(--space-12)" }, p.style) }),
      items.map(function(text, i){
        return e("div", { key: i, style: { display: "flex", gap: "var(--space-12)" } },
          e("div", { style: { fontWeight: "var(--weight-semibold)", fontSize: "var(--text-chip-size)", color: "var(--accent)", paddingTop: "2px" } }, String(i + 1).padStart(2, "0")),
          e("div", { style: { fontSize: "var(--text-body-lg-size)", lineHeight: "var(--text-body-leading)", color: "var(--text-secondary)" } }, text));
      }));
  }

  function AppHeader(p){
    var rest = Object.assign({}, p);
    delete rest.title; delete rest.eyebrow; delete rest.meta; delete rest.action; delete rest.style;
    return e("div", Object.assign({}, rest, { style: Object.assign({ display: "flex", flexDirection: "column", gap: "var(--space-20)" }, p.style) }),
      e("div", { style: { display: "flex", gap: "7px", alignItems: "center", fontSize: "13px", fontWeight: "var(--weight-semibold)", color: "var(--text-faint)" } },
        e("div", { style: { width: "6px", height: "6px", borderRadius: "var(--radius-pill)", background: "var(--accent)" } }),
        e("div", null, "Lantern")),
      e("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-12)" } },
        e("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-3)" } },
          p.eyebrow ? e("div", { style: { fontSize: "var(--text-eyebrow-size-sm)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--text-eyebrow-tracking-wide)", textTransform: "uppercase", color: "var(--text-body)" } }, p.eyebrow) : null,
          e("div", { style: { fontWeight: "var(--weight-bold)", letterSpacing: "var(--text-display-tracking)", fontSize: "var(--text-headline-size)", lineHeight: "1.15", color: "var(--text-primary)" } }, p.title)),
        p.meta ? e("div", { style: { fontSize: "var(--text-eyebrow-size)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--text-eyebrow-tracking)", textTransform: "uppercase", color: "var(--text-body)" } }, p.meta) : null,
        p.action || null));
  }

  /* ---------- ui kit screens ---------- */
  function PhoneFrame(p){
    var rest = Object.assign({}, p);
    delete rest.style; delete rest.children;
    return e("div", Object.assign({}, rest, { style: Object.assign({
      width: "390px", height: "812px", flexShrink: 0,
      background: "var(--surface-app)", borderRadius: "var(--radius-device)",
      boxShadow: "var(--shadow-device)", overflow: "hidden",
      display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)"
    }, p.style) }), p.children);
  }

  function Conversation(p){
    p = p || {};
    return e(PhoneFrame, null,
      e("div", { style: { padding: "22px 26px 0" } },
        e(AppHeader, {
          eyebrow: "Tuesday, 26 August",
          title: "Good morning, Sarah.",
          action: e(StatePill, { tone: "neutral", onClick: p.onOpenDashboard, style: { cursor: "pointer", gap: "6px" } },
            e("span", { style: { width: 6, height: 6, borderRadius: 999, background: "var(--accent)" } }), "Today ›")
        })),
      e("div", { style: { flex: 1, padding: "18px 22px 0", display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" } },
        e(MessageBubble, { from: "companion" }, "How was last night for the two of you?"),
        e(MessageBubble, { from: "caregiver" }, "He was up at 2 and again at 4. Wandered into the kitchen. I got maybe four hours."),
        e(MessageBubble, { from: "companion" },
          e("div", null, "Four hours is not enough, and this is the fourth night this week. I've noted it."),
          e(InsetPanel, { label: "Added to Dad's log" },
            e(ChipRow, { gap: "6px" },
              e(LogChip, null, "Sleep · 2 wakings"),
              e(LogChip, null, "Night wandering"),
              e(LogChip, { tone: "caution" }, "Your sleep · 4h"))),
          e("div", null, "Was the kitchen the destination, or did he seem to be looking for something?")),
        p.answered
          ? e(MessageBubble, { from: "caregiver" }, p.answered)
          : e(ChipRow, null,
              ["Looking for something", "Just pacing", "Not sure"].map(function(t){
                return e(SuggestionChip, { key: t, onClick: function(){ p.onAnswer && p.onAnswer(t); } }, t);
              }))),
      e("div", { style: { padding: "16px 20px 22px" } },
        e(Composer, { placeholder: "Type as much or as little as you like" })));
  }

  function Dashboard(p){
    p = p || {};
    return e(PhoneFrame, null,
      e("div", { onClick: p.onBack, style: { padding: "22px 26px 0", display: "flex", gap: "7px", alignItems: "center", fontSize: "13px", fontWeight: 600, color: "var(--text-faint)", cursor: "pointer" } },
        e("div", { style: { width: 6, height: 6, borderRadius: 999, background: "var(--accent)" } }),
        e("div", null, "Lantern")),
      e("div", { style: { padding: "20px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" } },
        e("div", { style: { fontWeight: 700, letterSpacing: "-0.015em", fontSize: "22px", color: "var(--text-primary)" } }, "Today"),
        e(SectionLabel, null, "Tue, 26 Aug")),
      e("div", { style: { padding: "14px 20px 0", display: "flex", flexDirection: "column", gap: "9px" } },
        e(Card, { onClick: p.onOpenBrief, style: { cursor: "pointer", paddingBottom: "15px" } },
          e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            e(SectionLabel, null, "Where Dad is"),
            e(StatePill, { tone: "steady" }, "Steady")),
          e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            e(StageHeadline, { stage: "Early", qualifier: "moderate" }),
            e("div", { style: { fontSize: "14px", lineHeight: 1.55, color: "var(--text-body)" } }, "Nothing has shifted in the last three weeks.")),
          e(Sparkline, { values: [40, 52, 44, 60, 55, 70, 66] }),
          e(TrendRow, { items: [
            { label: "Sleep", value: "Worsening", tone: "caution" },
            { label: "Eating", value: "Steady" },
            { label: "Mobility", value: "Steady" }
          ] })),
        e(Card, null,
          e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            e(SectionLabel, null, "Where you are"),
            e(StatePill, { tone: "caution" }, "Stretched")),
          e("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
            e(StateTrack, { value: 64, tone: "caution" }),
            e("div", { style: { fontSize: "14px", lineHeight: 1.55, color: "var(--text-body)" } }, "You've been up past 1am four nights running. That's usually the first sign, not the last."))),
        e(Card, { variant: "dark" },
          e(SectionLabel, { onDark: true }, "In front of you"),
          e("div", { style: { display: "flex", flexDirection: "column", gap: "12px" } },
            e(TaskItem, { onDark: true }, "Two hours of respite care this week — I found three options near you."),
            e(TaskItem, { onDark: true }, "Move Dad's bedtime routine 30 minutes earlier.")))),
      e("div", { style: { marginTop: "auto", padding: "16px 20px 22px" } },
        e(Composer, { onSend: p.onBack })));
  }

  function TransitionBrief(p){
    p = p || {};
    return e(PhoneFrame, null,
      e("div", { style: { padding: "26px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" } },
        e("div", { onClick: p.onBack, style: { fontSize: "22px", color: "var(--text-faint)", cursor: "pointer", lineHeight: 1 } }, "←"),
        e(SectionLabel, null, "Something to know"),
        e("div", { style: { width: "22px" } })),
      e("div", { style: { padding: "24px 26px 0", display: "flex", flexDirection: "column", gap: "12px" } },
        e(StatePill, { tone: "caution", style: { alignSelf: "flex-start", padding: "6px 12px" } }, "Possible shift ahead"),
        e("div", { style: { fontWeight: 700, letterSpacing: "-0.015em", fontSize: "25px", lineHeight: 1.18, color: "var(--text-primary)" } },
          "The pattern in Dad's last two weeks looks like an early shift toward the Middle stage."),
        e("div", { style: { fontSize: "14px", lineHeight: 1.55, color: "var(--text-body)", textWrap: "pretty" } },
          "Night wandering, needing help with buttons, and calling you by your mother's name are three of the changes that usually appear together at this point. This is a pattern in your logs, not a diagnosis — his doctor is the one to confirm it.")),
      e("div", { style: { padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: "11px" } },
        e(Card, { variant: "panel", style: { padding: "16px 18px" } },
          e(SectionLabel, { size: "sm" }, "What tends to help now"),
          e(GuidanceList, { items: [
            "Lay out clothes in the order they go on. It buys back the dressing hour.",
            "A night light in the hallway and a bed sensor, before the next wandering night.",
            "When he uses the wrong name, answer the feeling, not the fact."
          ] })),
        e(Card, { variant: "muted", gap: "var(--space-8)", style: { padding: "18px 20px" } },
          e("div", { style: { fontSize: "14.5px", fontWeight: 600, color: "var(--text-secondary)" } }, "Bring this to his next appointment"),
          e("div", { style: { fontSize: "13.5px", lineHeight: 1.55, color: "var(--text-body)" } }, "A one-page summary of the last 14 days, ready to print or send."))),
      e("div", { style: { marginTop: "auto", padding: "18px 20px 24px", display: "flex", flexDirection: "column", gap: "10px" } },
        e(Button, { onClick: p.onBack }, "Talk this through with Lantern"),
        e(Button, { variant: "quiet", onClick: p.onBack }, "Not now")));
  }

  window.Lantern = {
    Card: Card, InsetPanel: InsetPanel, SectionLabel: SectionLabel,
    StatePill: StatePill, StateTrack: StateTrack, TrendRow: TrendRow, Sparkline: Sparkline, StageHeadline: StageHeadline,
    MessageBubble: MessageBubble, LogChip: LogChip, SuggestionChip: SuggestionChip, ChipRow: ChipRow, Composer: Composer,
    Button: Button, TaskItem: TaskItem, GuidanceList: GuidanceList, AppHeader: AppHeader,
    PhoneFrame: PhoneFrame, Conversation: Conversation, Dashboard: Dashboard, TransitionBrief: TransitionBrief
  };
})();
