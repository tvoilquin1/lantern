import { tool } from 'ai';
import { z } from 'zod';

export const CRISIS_KEYWORDS = [
  'kill myself',
  'end my life',
  "don't want to be here",
  "can't go on",
  'suicide',
  'harm myself',
];

export const CRISIS_RESPONSE =
  "I hear how much pain you're in right now. Please reach out to the 988 Suicide and Crisis Lifeline — call or text 988. They're available 24/7 and can help. I'll be here when you're ready to talk.";

export function checkCrisisKeywords(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const flagCrisisTool = tool({
  description:
    'Flag a message as containing crisis-level language requiring immediate escalation. Use when the message contains suicidal ideation, self-harm intent, or hopelessness at clinical severity that the keyword bypass may not have caught. Do not use for general distress or burnout — only for crisis-level signals.',
  parameters: z.object({
    severity: z
      .enum(['high', 'critical'])
      .describe(
        'high = clear crisis language but no explicit intent stated; critical = explicit intent or imminent risk',
      ),
    trigger_phrase: z
      .string()
      .describe("The caregiver's words that triggered this flag — preserved verbatim for context"),
    source: z
      .enum(['caregiver_self', 'patient_report'])
      .describe(
        'Whether the crisis language is about the caregiver (primary concern) or the patient (forward to relevant resource only if applicable)',
      ),
  }),
});
