import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, formatDataStreamPart, generateObject, streamText, type CoreMessage } from 'ai';
import { z } from 'zod';
import { CRISIS_RESPONSE, checkCrisisKeywords } from '@/lib/companion/crisis';
import { stagingQuestions } from '@/data/stagingQuestions';
import { wellbeingItems } from '@/data/wellbeingItems';
import { createClient } from '@/lib/supabase/server';
import { copy } from '@/constants/copy';

export const runtime = 'nodejs';

type OnboardingStep = 'staging' | 'lcws' | 'complete';

type OnboardRequestBody = {
  messages: CoreMessage[];
  sessionId?: string | null;
};

type SupabaseServerClient = ReturnType<typeof createClient>;

function buildStagingSystemPrompt(): string {
  const questionList = stagingQuestions.map((q) => `- ${q.text}`).join('\n');
  return [
    "You are the Lantern companion, guiding a family caregiver through a short onboarding conversation to understand the person they're caring for.",
    'Ask about the following topics conversationally, one or two at a time, in your own words — do not read them as a checklist:',
    questionList,
    "Once you have a clear picture of the patient's current abilities, tell the caregiver in plain language which Lantern stage (early, middle, or late) the person seems to be in, explain briefly why, and ask them to confirm it sounds right.",
    'Never use external instrument names or numeric stage scales — use only the Lantern-original stage names (early, middle, late).',
    'This is not medical advice.',
  ].join('\n\n');
}

function buildLcwsSystemPrompt(): string {
  const itemList = wellbeingItems.map((item) => `- ${item.question}`).join('\n');
  return [
    'You are the Lantern companion, checking in with a family caregiver about their own wellbeing as part of a short baseline conversation.',
    'Weave the following questions into a warm, natural conversation, one or two at a time — do not read them as a checklist, and do not show the caregiver a numeric scale.',
    itemList,
    'This is not medical advice.',
  ].join('\n\n');
}

const STAGE_SCHEMA = z.object({
  readyToConfirm: z
    .boolean()
    .describe('True only if the caregiver has just confirmed a proposed Lantern stage in their latest message'),
  stageId: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .nullable()
    .describe('1 = Early, 2 = Middle, 3 = Late. Null if not yet confirmed.'),
});

const lcwsScoreShape = Object.fromEntries(
  wellbeingItems.map((item) => [item.id, z.number().min(0).max(4).nullable()]),
);

const LCWS_SCHEMA = z.object({
  complete: z.boolean().describe('True only if every wellbeing item below has been discussed and scored'),
  scores: z.object(lcwsScoreShape),
});

async function writeProgress(
  supabase: SupabaseServerClient,
  existingId: string | undefined,
  currentStep: OnboardingStep,
  partialState: Record<string, unknown>,
) {
  if (existingId) {
    await supabase
      .from('onboarding_progress')
      .update({ current_step: currentStep, partial_state: partialState })
      .eq('id', existingId);
  } else {
    await supabase.from('onboarding_progress').insert({ current_step: currentStep, partial_state: partialState });
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as OnboardRequestBody;
  const { messages } = body;

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const lastUserText = typeof lastUserMessage?.content === 'string' ? lastUserMessage.content : '';

  if (checkCrisisKeywords(lastUserText)) {
    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.write(formatDataStreamPart('text', CRISIS_RESPONSE));
      },
    });
  }

  const supabase = createClient();

  const { data: progressRow } = await supabase
    .from('onboarding_progress')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentStep: OnboardingStep = (progressRow?.current_step as OnboardingStep | undefined) ?? 'staging';

  if (currentStep === 'complete') {
    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.write(formatDataStreamPart('text', copy.onboardingCompleteMessage));
      },
    });
  }

  const system = currentStep === 'staging' ? buildStagingSystemPrompt() : buildLcwsSystemPrompt();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const result = streamText({
        model: anthropic('claude-sonnet-4-6'),
        system,
        messages,
      });

      let assistantText = '';
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          assistantText += part.textDelta;
          dataStream.write(formatDataStreamPart('text', part.textDelta));
        } else if (part.type === 'error') {
          throw part.error;
        }
      }

      const conversation: CoreMessage[] = [...messages, { role: 'assistant', content: assistantText }];

      if (currentStep === 'staging') {
        const { object } = await generateObject({
          model: anthropic('claude-sonnet-4-6'),
          schema: STAGE_SCHEMA,
          system:
            'Given this onboarding conversation between the Lantern companion and a caregiver, determine whether the caregiver has just confirmed a proposed Lantern stage (early=1, middle=2, late=3) for the patient in their latest message.',
          messages: conversation,
        });

        if (object.readyToConfirm && object.stageId) {
          const { data: existingProfile } = await supabase
            .from('patient_profile')
            .select('id')
            .limit(1)
            .maybeSingle();

          const profilePayload = {
            stage_id: object.stageId,
            stage_confirmed_by_caregiver: true,
            stage_confirmed_at: new Date().toISOString(),
          };

          if (existingProfile) {
            await supabase.from('patient_profile').update(profilePayload).eq('id', existingProfile.id);
          } else {
            await supabase.from('patient_profile').insert(profilePayload);
          }

          await writeProgress(supabase, progressRow?.id, 'lcws', {});
        } else {
          await writeProgress(supabase, progressRow?.id, 'staging', progressRow?.partial_state ?? {});
        }
      } else if (currentStep === 'lcws') {
        const { object } = await generateObject({
          model: anthropic('claude-sonnet-4-6'),
          schema: LCWS_SCHEMA,
          system:
            'Given this onboarding conversation, extract a 0-4 score for each wellbeing item the caregiver has clearly addressed so far, and mark complete=true only once every item below has been covered.',
          messages: conversation,
        });

        if (object.complete) {
          const scores = object.scores as Record<string, number | null>;

          const domainScores = wellbeingItems
            .filter((item) => !item.isGlobalItem)
            .map((item) => scores[item.id])
            .filter((score): score is number => typeof score === 'number');

          const globalItem = wellbeingItems.find((item) => item.isGlobalItem);
          const overallBurdenScore = globalItem ? (scores[globalItem.id] ?? null) : null;

          const baselineScore =
            domainScores.length > 0 ? domainScores.reduce((sum, s) => sum + s, 0) / domainScores.length : null;

          const { data: existingState } = await supabase
            .from('caregiver_state')
            .select('id')
            .limit(1)
            .maybeSingle();

          const statePayload = {
            lcws_baseline_score: baselineScore,
            lcws_overall_burden_score: overallBurdenScore,
            last_lcws_at: new Date().toISOString(),
          };

          if (existingState) {
            await supabase.from('caregiver_state').update(statePayload).eq('id', existingState.id);
          } else {
            await supabase.from('caregiver_state').insert(statePayload);
          }

          await writeProgress(supabase, progressRow?.id, 'complete', {});
        } else {
          await writeProgress(supabase, progressRow?.id, 'lcws', { scores: object.scores });
        }
      }
    },
  });
}
