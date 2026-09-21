import { tool } from 'ai';
import { z } from 'zod';
import { createSupabaseRestClient } from '@/lib/supabase/rest-client';
import { wellbeingItems } from '@/data/wellbeingItems';

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

const lcwsRescreenScoreShape = Object.fromEntries(
  wellbeingItems.map((item) => [item.id, z.number().min(0).max(4).nullable()]),
);

const lcwsRescreenParameters = z.object({
  complete: z.boolean().describe('True only if every wellbeing item below has been discussed and scored'),
  scores: z.object(lcwsRescreenScoreShape),
});

export type LcwsRescreenScores = z.infer<typeof lcwsRescreenParameters>;

/**
 * Fires when the companion has finished conversationally administering the
 * biweekly LCWS re-screen (see systemPrompt.ts's lcwsRescreenDue section).
 * Writes lcws_latest_score / lcws_latest_overall_burden_score / last_lcws_at
 * — distinct from lcws_baseline_score, which stays the onboarding-time value.
 * Same error-swallowing contract as createLogPatientObservationTool.
 */
export function createRecordLcwsRescreenTool() {
  return tool({
    description:
      'Record the biweekly LCWS wellbeing re-screen once every item has been conversationally covered. Only call with complete: true when all items are scored.',
    parameters: lcwsRescreenParameters,
    execute: async ({ complete, scores }: LcwsRescreenScores) => {
      if (!complete) {
        return { acknowledged: false };
      }

      try {
        const domainItems = wellbeingItems.filter((item) => !item.isGlobalItem);
        const domainScores = domainItems.map((item) => scores[item.id]).filter((s): s is number => s != null);

        if (domainScores.length !== domainItems.length) {
          return { acknowledged: false };
        }

        const latestScore = domainScores.reduce((sum, s) => sum + s, 0) / domainScores.length;
        const globalItem = wellbeingItems.find((item) => item.isGlobalItem);
        const overallBurdenScore = globalItem ? (scores[globalItem.id] ?? null) : null;

        const supabase = createSupabaseRestClient();
        const { data: existing, error: selectError } = await supabase.from('caregiver_state').select('id');

        if (selectError || !existing || existing.length === 0) {
          console.error('[record_lcws_rescreen] no caregiver_state row found', selectError);
          return { acknowledged: false };
        }

        const { error } = await supabase
          .from('caregiver_state')
          .eq('id', existing[0]!.id as string)
          .update({
            lcws_latest_score: latestScore,
            lcws_latest_overall_burden_score: overallBurdenScore,
            last_lcws_at: new Date().toISOString(),
          });

        if (error) {
          console.error('[record_lcws_rescreen] caregiver_state update failed', error);
          return { acknowledged: false };
        }

        return { acknowledged: true };
      } catch (error) {
        console.error('[record_lcws_rescreen] unexpected failure', error);
        return { acknowledged: false };
      }
    },
  });
}
