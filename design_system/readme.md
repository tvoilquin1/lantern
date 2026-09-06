# Lantern Design System

Lantern is an AI companion for people caring for someone with dementia. It has two pillars:
a **conversational companion** that runs a proactive daily check-in and extracts a structured
patient log from ordinary talk, and a **dashboard** that answers three questions at a glance —
*where is the patient*, *where am I*, *what's in front of me*.

The primary user is a caregiver (persona: Sarah) who is tired, time-poor, and frightened. Every
decision in this system is downstream of that.

## Source

This system was extracted from **direction 1a "Lamplight"** in `Lantern UI Explorations.dc.html`
(in this project) — the direction the team selected. No external codebase, Figma file, or brand
guideline was supplied.

Two consequences, both flagged for you to correct:
- **No logo.** There is no Lantern wordmark or symbol. Wherever a mark belongs, the system renders
  the word "Lantern" in 13px/600 ink-400 preceded by a 6px sage dot. Do not invent one.
- **No brand typeface.** Plus Jakarta Sans (Google Fonts) is a substitution chosen for its warm,
  slightly humanist geometry. Swap `--font-sans` in `tokens/typography.css` when a real face exists.

---

## Product principles

These are not style rules; they constrain the UI.

1. **The conversation is home.** The app opens on the companion, never the dashboard. A dashboard-first
   app greets a frightened person with a status report on the worst thing in their life.
2. **Lantern coaches; it does not diagnose.** Stage language is always framed as a pattern in the logs,
   with the doctor named as the one who confirms. The disclaimer lives inside the paragraph, never in
   fine print.
3. **The word leads, the colour follows.** Every state is named in plain language ("Stretched thin")
   before it is coloured. Clinical scores (LCWS levels, baseline scores, stage labels — Early/Middle/Late)
   are footnotes, never headlines — the caregiver has not been taught the scales.
4. **No gamification.** No streaks, no completion percentages, no "you missed 3 check-ins". A logging gap
   is a burnout signal to act on quietly, not a failure to report back.
5. **Three things maximum.** Three cards on the dashboard, three items of guidance, two or three tasks.
6. **Extraction is visible.** Data the companion pulls from conversation is shown back in an InsetPanel,
   so it stays correctable.

---

## Content fundamentals

**Person and address.** Second person to the caregiver ("you"), first person for Lantern ("I've noted it",
"I found three options near you"). The patient is named as the caregiver names him — "Dad", not "the patient"
or "the care recipient".

**Sentence casing everywhere.** Title Case appears nowhere. Uppercase is used only in eyebrow labels, where
it is tracked out to 0.12–0.14em and set at 10.5–11px.

**Observation before interpretation.** State the fact from the log, then what it usually means:

> "You've been up past 1am four nights running. That's usually the first sign, not the last."
> "Four hours is not enough, and this is the fourth night this week. I've noted it."

**Specific over general.** "Two hours of respite care this week — I found three options near you", not
"consider taking a break". Every suggested action names a concrete next step Lantern has already part-done.

**Hold space before solving.** When the caregiver expresses despair, the first response contains no advice:

> "That's a heavy thing to be carrying at 9am. You don't have to have a plan right now — I'm here."

**Invite, never instruct.** "Talk this through with Lantern" / "Not now". Never "Complete your check-in".
Always offer a way out of any heavy moment.

**Never write.** Alert language ("Alert: burnout detected"), bare scores as headlines ("58/88"), clinical
imperatives ("You must contact a physician"), streak or compliance framing, exclamation marks, emoji.

---

## Visual foundations

**Colour.** A warm paper ground (`#F6F2EA`) with off-white cards (`#FFFDFA`) — no pure white, no cool grey
anywhere in the system. Sage (`#5F7A63`) is the only true accent, and it means *steady*. Ochre (`#9A6A2E`)
is caution. Clay (`#A0503F`) is the highest tier and deliberately replaces signal red, because nothing in
Lantern should look like an emergency it cannot resolve. At most one dark block (`--sage-900`) per screen.

**Type.** One family, Plus Jakarta Sans, four weights. Hierarchy comes from weight and tracking, never from
a second face: display and headline are 700 with -0.015em tracking; body is 400 at 1.55 leading; eyebrows are
600 uppercase at 0.12em. Message text is 15.5px — larger than typical UI body, because the conversation is
the product.

**Backgrounds.** Flat warm paper. No gradients (the single exception is the continuous burden track, which
ramps sage → ochre), no photography, no illustration, no texture, no pattern. Emptiness is intentional.

**Corners and cards.** Nothing has a square corner. Cards are 28px, panels and bubbles 24px, insets 16px,
chips 8px, buttons and pills fully round, the device frame 42px. A card is defined by its **edge, not its
lift**: a 1px hairline ring at 5% ink, plus at most a 1px shadow. The only elements with real drop shadow are
the composer (which floats over scrolling content) and the device frame.

**Chat bubbles.** Companion turns are paper with a hairline ring, tail bottom-left; caregiver turns are sage
tint with no ring, tail bottom-right. The tail is one corner tightened from 24px to 8px.

**Spacing.** Not a strict 4px grid — the rhythm is 17/20 card padding, 11px inside a card, 9px between
stacked cards, 20–26px screen gutters. Use the literal token values rather than snapping to 4/8.

**Motion.** Nothing bounces, springs, or slides in. Fades and settles only, 120–320ms on
`cubic-bezier(0.22, 0.61, 0.36, 1)`. No loading spinners in the conversation — use a typing indicator.

**Hover and press.** Hover is a 3.5% warm ink tint or a shift one step darker in the sage ramp (links go
`#5F7A63` → `#3F5745`). Press is a 0.985 scale, no colour change. No focus glow — focus is a sage ring
at the element's own radius.

**Transparency and blur.** Essentially unused. Transparency appears only in shadow and border colours.
No frosted glass, no scrims.

**Touch targets.** 44px minimum on everything tappable, including suggestion chips.

---

## Iconography

Lantern is close to iconless, and that is the point — an icon set would add visual noise to screens whose
job is to feel quiet. There is no icon font, no SVG icon library, and no emoji anywhere.

The full vocabulary:
- A **6px sage dot** — the Lantern mark, and the only recurring symbol in the product.
- An **18px rounded square outline** (1.5px sage) — the task checkbox.
- **Two-digit ordinals** (`01`, `02`, `03`) in sage semibold — numbered guidance.
- Three **unicode marks**: `↑` (send, on the sage circle), `←` (back), `›` (drill in).

If a future screen genuinely needs a glyph set, use Lucide at 1.5px stroke — it is the closest match to the
line weight already in the system — and document the addition here. Do not hand-draw SVG icons.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | The entry point consumers link. Imports everything below. |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `radius`, `elevation`, `motion` |
| `components/surfaces/` | `Card`, `InsetPanel`, `SectionLabel` |
| `components/status/` | `StatePill`, `StateTrack`, `TrendRow`, `Sparkline`, `StageHeadline` |
| `components/conversation/` | `MessageBubble`, `LogChip`, `SuggestionChip`, `ChipRow`, `Composer` |
| `components/actions/` | `Button`, `TaskItem`, `GuidanceList`, `AppHeader` |
| `ui_kits/companion/` | Three interactive screens — conversation, dashboard, transition brief |
| `guidelines/` | Foundation specimen cards (colour, type, spacing, voice, iconography) |
| `SKILL.md` | Agent Skills manifest, for use in Claude Code |

### Intentional additions

The source is a design exploration, not a component library, so the inventory above was derived from what
1a actually renders. Three items are mild generalisations rather than literal extractions:

- **`Card` variants** — 1a hand-rolls four surface treatments; they are unified into one component.
- **`StateTrack segments`** — the segmented form comes from 1b, adopted into 1a because a named tier reads
  better than an unexplained bar.
- **Clay tier** — 1a has no crisis colour. Clay was defined so escalation does not force a signal red later.

---

## Not yet built

The MVP scope names screens this system does not yet cover: **onboarding** (patient stage inference + LCWS
baseline, one question per screen), **the knowledge-base / learn surface**, **settings** (check-in frequency,
quiet hours), and **crisis-tier states**. The tokens and primitives support them; the screens do not exist. Ask before
assuming a pattern for these.
