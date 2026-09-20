import { tool } from 'ai';
import { z } from 'zod';
import { createSupabaseRestClient } from '@/lib/supabase/rest-client';

export { flagCrisisTool } from './crisis';

const patientObservationParameters = z.object({
  sleep: z
    .object({
      quality: z.enum(['good', 'disrupted', 'very_poor', 'unknown']).optional(),
      incidents: z
        .array(z.string())
        .optional()
        .describe("e.g. 'up three times', 'confused at 2am', 'found wandering'"),
    })
    .optional(),
  nutrition: z
    .object({
      ate_meals: z.boolean().optional(),
      concerns: z
        .array(z.string())
        .optional()
        .describe("e.g. 'refused dinner', 'forgot to eat', 'lost 2 pounds'"),
    })
    .optional(),
  mobility: z
    .object({
      status: z.enum(['normal', 'reduced', 'fall', 'unknown']).optional(),
      notes: z.string().optional(),
    })
    .optional(),
  behavioral_changes: z
    .array(
      z.object({
        type: z
          .string()
          .describe("e.g. 'increased_agitation', 'confusion', 'paranoia', 'social_withdrawal'"),
        description: z.string().optional(),
      }),
    )
    .optional(),
  safety_flags: z
    .array(
      z.object({
        type: z.enum([
          'stove_incident',
          'wandering',
          'fall',
          'medication_error',
          'exploitation_risk',
          'aggression',
          'unsupervised_exit',
          'other',
        ]),
        description: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
      }),
    )
    .optional()
    .describe('Only populate if a safety incident was explicitly described'),
  transition_signals: z
    .array(
      z.object({
        signal: z
          .string()
          .describe("e.g. 'forgot_to_eat', 'stove_left_on', 'wandered_outside', 'medication_mismanaged'"),
        raw_quote: z.string().describe('Exact caregiver words that triggered this flag'),
      }),
    )
    .optional()
    .describe('Patterns that may indicate a stage transition — only flag if clearly present'),
  nothing_notable: z
    .boolean()
    .optional()
    .describe("True if the caregiver's response contains no extractable patient observations"),
});

export type PatientObservation = z.infer<typeof patientObservationParameters>;

export type LogPatientObservationContext = {
  sessionId: string | null;
  source: 'check_in' | 'open_conversation';
};

/**
 * Fires silently after each companion turn (see Ref/phase-3-prd.md §5 Feature 3).
 * Extraction errors must never interrupt the conversation — log and swallow.
 */
export function createLogPatientObservationTool(ctx: LogPatientObservationContext) {
  return tool({
    description:
      "Extract structured patient observation data from caregiver's free-text response. Only extract what is explicitly mentioned — do not infer or fill in unknowns.",
    parameters: patientObservationParameters,
    execute: async (observation: PatientObservation) => {
      try {
        const supabase = createSupabaseRestClient();
        const { error } = await supabase.from('patient_log').insert({
          session_id: ctx.sessionId,
          sleep: observation.sleep ?? null,
          nutrition: observation.nutrition ?? null,
          mobility: observation.mobility ?? null,
          behavioral_changes: observation.behavioral_changes ?? null,
          safety_flags: observation.safety_flags ?? null,
          transition_signals: observation.transition_signals ?? null,
          nothing_notable: observation.nothing_notable ?? false,
          source: ctx.source,
        });

        if (error) {
          console.error('[log_patient_observation] patient_log insert failed', error);
          return { acknowledged: false };
        }

        return { acknowledged: true };
      } catch (error) {
        console.error('[log_patient_observation] unexpected extraction failure', error);
        return { acknowledged: false };
      }
    },
  });
}
