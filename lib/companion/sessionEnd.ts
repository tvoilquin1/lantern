import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, type CoreMessage } from "ai";
import { z } from "zod";
import { GAUGE_MIN, GAUGE_MAX } from "./burnout";

const SESSION_END_SCHEMA = z.object({
  summary: z
    .string()
    .describe(
      "A 100-200 word rolling summary of this conversation, written for the companion to recall next time."
    ),
  sentimentScore: z
    .number()
    .min(GAUGE_MIN)
    .max(GAUGE_MAX)
    .describe(
      "The caregiver's self-reported emotional/wellbeing state this session, on a 1-5 scale (5 = stable/doing well, 1 = crisis). Judge from their own words, not the patient's condition."
    ),
});

export type SessionEndResult = z.infer<typeof SESSION_END_SCHEMA>;

/**
 * Computed server-side, after the session ends — never in real time during
 * the conversation (Phase 5 brief). No raw transcript is persisted; only the
 * resulting summary + score are written to sessions/caregiver_state.
 */
export async function summarizeAndScoreSession(messages: CoreMessage[]): Promise<SessionEndResult> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: SESSION_END_SCHEMA,
    system:
      "Given this conversation between the Lantern companion and a family caregiver, write a rolling summary for next time, and separately score the caregiver's own emotional/wellbeing state this session (not the patient's condition) on a 1-5 scale.",
    messages,
  });

  return object;
}
